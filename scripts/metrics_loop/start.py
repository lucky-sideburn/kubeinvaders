from asyncio.log import logger
import yaml
import json
import logging
import os
import sys

logging.basicConfig(
    level=logging.INFO,
    stream=sys.stdout,
    format="%(asctime)s %(levelname)s %(message)s",
    force=True,
)
logging.getLogger().setLevel(logging.INFO)
_file_handler = logging.FileHandler("/tmp/kubeinvaders_metrics_loop.log")
_file_handler.setLevel(logging.INFO)
_file_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
logging.getLogger().addHandler(_file_handler)
from kubernetes import client, config
from kubernetes.client.rest import ApiException
import requests
from string import Template
import string
import random
import redis
import time
import urllib3
from urllib.parse import urlparse
from urllib3.exceptions import LocationValueError
from urllib3.exceptions import MaxRetryError
import time
import datetime
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def normalize_k8s_host(raw_host):
    if not raw_host:
        return ""
    host = str(raw_host).strip().strip('"').strip("'")
    if not host:
        return ""
    if not host.startswith("http://") and not host.startswith("https://"):
        host = "https://" + host
    host = host.rstrip("/")
    parsed = urlparse(host)
    if not parsed.netloc:
        return ""
    return host

def join_string_to_array(project_list_string, separator):
    return project_list_string.split(separator)

def do_http_request(url, method, headers, data):
    try:
        # Do not inherit HTTP(S)_PROXY from the container environment;
        # those proxies often cannot resolve in-cluster or local ingress hosts.
        with requests.Session() as session:
            session.trust_env = False
            response = session.request(
                method,
                url,
                headers=headers,
                data=data,
                verify=False,
                allow_redirects=True,
                timeout=10,
            )
        return response
    except requests.exceptions.RequestException as e:
        logging.error(f"Error while sending HTTP request to {url} with method {method}: {e}")
        return "Connection Error"

def check_if_json_is_valid(json_data):
    try:
        json.loads(json_data)
    except ValueError as e:
        return False
    return True

def create_container(image, name, command, args):
    container = client.V1Container(
        image=image,
        name=name,
        image_pull_policy='IfNotPresent',
        args=args,
        command=command,
    )

    logging.debug(
        f"Created container with name: {container.name}, "
        f"image: {container.image} and args: {container.args}"
    )

    return container

def create_pod_template(pod_name, container, job_name):
    pod_template = client.V1PodTemplateSpec(
        spec=client.V1PodSpec(restart_policy="Never", containers=[container]),
        metadata=client.V1ObjectMeta(name=pod_name, labels={"chaos-controller": "kubeinvaders", "job-name": job_name}),
    )

    return pod_template

def create_job(job_name, pod_template):
    metadata = client.V1ObjectMeta(name=job_name, labels={"chaos-controller": "kubeinvaders"})

    job = client.V1Job(
        api_version="batch/v1",
        kind="Job",
        metadata=metadata,
        spec=client.V1JobSpec(backoff_limit=0, template=pod_template),
    )
    #logger.info(job)
    return job


r = redis.Redis(unix_socket_path='/tmp/redis.sock')

logging.getLogger('kubernetes').setLevel(logging.ERROR)

logging.debug('Starting script for KubeInvaders metrics loop')

configuration = client.Configuration()
token = os.environ.get("TOKEN", "")
if not token:
    redis_token = r.get("x_k8s_token")
    if redis_token:
        token = redis_token.decode()
        logging.info("[k-inv][metrics_loop] TOKEN not set in env, using X-K8S-Token from Redis")
token = token.strip()
if token.lower().startswith("bearer "):
    token = token[7:].strip()
if not token:
    logging.warning("[k-inv][metrics_loop] No token available (TOKEN env and Redis x_k8s_token both empty) — API calls may fail")

configuration.api_key = {"authorization": token}
configuration.api_key_prefix = {"authorization": "Bearer"}

arg_host = sys.argv[1] if len(sys.argv) > 1 else ""
resolved_host = normalize_k8s_host(arg_host)

if not resolved_host:
    redis_endpoint = r.get("k8s_api_endpoint")
    if redis_endpoint:
        redis_endpoint = redis_endpoint.decode() if isinstance(redis_endpoint, bytes) else redis_endpoint
        resolved_host = normalize_k8s_host(redis_endpoint)
        if resolved_host:
            logging.info(f"[k-inv][metrics_loop] Using Kubernetes host from Redis k8s_api_endpoint: {resolved_host}")

if not resolved_host:
    resolved_host = normalize_k8s_host(os.environ.get("ENDPOINT", ""))
    if resolved_host:
        logging.info(f"[k-inv][metrics_loop] Using Kubernetes host from ENDPOINT: {resolved_host}")

if not resolved_host:
    svc_host = os.environ.get("KUBERNETES_SERVICE_HOST", "")
    svc_port = os.environ.get("KUBERNETES_SERVICE_PORT_HTTPS", "443")
    resolved_host = normalize_k8s_host(f"https://{svc_host}:{svc_port}" if svc_host else "")
    if resolved_host:
        logging.info(f"[k-inv][metrics_loop] Using in-cluster Kubernetes host: {resolved_host}")

if not resolved_host:
    resolved_host = "https://kubernetes.default.svc"
    logging.warning("[k-inv][metrics_loop] No valid Kubernetes host provided; defaulting to https://kubernetes.default.svc")

configuration.host = resolved_host
logging.info(f"[k-inv][metrics_loop] Kubernetes API host resolved to: {configuration.host}")

configuration.insecure_skip_tls_verify = True
configuration.verify_ssl = False

api_client = client.ApiClient(configuration=configuration)
api_instance = client.CoreV1Api(api_client)
batch_api = client.BatchV1Api(api_client)


def rebuild_api_client_from_fallbacks(current_configuration):
    fallback_host = ""

    redis_endpoint = r.get("k8s_api_endpoint")
    if redis_endpoint:
        redis_endpoint = redis_endpoint.decode() if isinstance(redis_endpoint, bytes) else redis_endpoint
        fallback_host = normalize_k8s_host(redis_endpoint)

    if not fallback_host:
        fallback_host = normalize_k8s_host(os.environ.get("ENDPOINT", ""))

    if not fallback_host:
        svc_host = os.environ.get("KUBERNETES_SERVICE_HOST", "")
        svc_port = os.environ.get("KUBERNETES_SERVICE_PORT_HTTPS", "443")
        fallback_host = normalize_k8s_host(f"https://{svc_host}:{svc_port}" if svc_host else "")

    if not fallback_host:
        fallback_host = "https://kubernetes.default.svc"

    current_configuration.host = fallback_host
    logging.warning(f"[k-inv][metrics_loop] Rebuilding Kubernetes API client with host: {fallback_host}")
    new_api_client = client.ApiClient(configuration=current_configuration)
    return client.CoreV1Api(new_api_client), client.BatchV1Api(new_api_client)


def sync_api_client_from_redis(current_configuration):
    redis_endpoint = r.get("k8s_api_endpoint")
    if not redis_endpoint:
        return None, None

    redis_endpoint = redis_endpoint.decode() if isinstance(redis_endpoint, bytes) else redis_endpoint
    redis_host = normalize_k8s_host(redis_endpoint)
    if not redis_host:
        return None, None

    if current_configuration.host != redis_host:
        current_configuration.host = redis_host
        logging.info(f"[k-inv][metrics_loop] Switching Kubernetes API host from Redis k8s_api_endpoint to: {redis_host}")
        new_api_client = client.ApiClient(configuration=current_configuration)
        return client.CoreV1Api(new_api_client), client.BatchV1Api(new_api_client)

    return None, None

while True:
    maybe_api_instance, maybe_batch_api = sync_api_client_from_redis(configuration)
    if maybe_api_instance and maybe_batch_api:
        api_instance, batch_api = maybe_api_instance, maybe_batch_api

    #logging.info(f"[k-inv][metrics_loop] Metrics loop is active - {r.exists('chaos_report_project_list')}")
    if r.exists('chaos_report_project_list'):
        logging.info("[k-inv][metrics_loop] Found chaos_report_project_list Redis Key")
        for project in join_string_to_array(r.get('chaos_report_project_list').decode(), ','):
            logging.info(f"[k-inv][metrics_loop] Computing Chaos Report Project: {project}")
            chaos_program_key = f"chaos_report_project_{project}"
            if r.exists(chaos_program_key):
                logging.info(f"[k-inv][metrics_loop][chaos_report] Found chaos_report_project_{project} key in Redis. Starting {project} ")

                if check_if_json_is_valid(r.get(chaos_program_key)):
                    chaos_report_program = json.loads(r.get(chaos_program_key))
                    now = datetime.datetime.now()

                    logging.info(f"[k-inv][metrics_loop][chaos_report] chaos_report_program is valid JSON: {chaos_report_program}")
                    url = str(chaos_report_program.get('chaosReportCheckSiteURL', '')).strip()
                    method = str(chaos_report_program.get('chaosReportCheckSiteURLMethod', 'GET')).strip().upper()
                    payload = chaos_report_program.get('chaosReportCheckSiteURLPayload', '')

                    logging.info(
                        f"[k-inv][metrics_loop][chaos_report] project={project} parsed url='{url}' method='{method}'"
                    )

                    headers = {"Content-Type": "application/json; charset=utf-8"}
                    raw_headers = chaos_report_program.get('chaosReportCheckSiteURLHeaders', '{}')
                    try:
                        parsed_headers = json.loads(raw_headers) if isinstance(raw_headers, str) else raw_headers
                        if isinstance(parsed_headers, dict):
                            headers = parsed_headers
                    except Exception as e:
                        logging.warning(f"Invalid chaos report headers for project {project}: {e}")

                    if method not in ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]:
                        method = "GET"

                    with open("/tmp/kubeinvaders_url_debug.log", "w") as dbg:
                        dbg.write(f"--- {datetime.datetime.now().isoformat()} ---\n")
                        dbg.write(f"  project          = {project!r}\n")
                        dbg.write(f"  chaos_program_key= {chaos_program_key!r}\n")
                        dbg.write(f"  raw redis value  = {r.get(chaos_program_key)!r}\n")
                        dbg.write(f"  chaos_report_program = {chaos_report_program}\n")
                        dbg.write(f"  url (raw)        = {chaos_report_program.get('chaosReportCheckSiteURL')!r}\n")
                        dbg.write(f"  url (stripped)   = {url!r}\n")
                        dbg.write(f"  method           = {method!r}\n")
                        dbg.write(f"  headers          = {headers}\n")
                        dbg.write(f"  payload          = {payload!r}\n")

                    if not url:
                        logging.warning(
                            f"[k-inv][metrics_loop][chaos_report] Empty chaosReportCheckSiteURL for project={project}. Raw program: {chaos_report_program}"
                        )
                        response = "Connection Error"
                    else:
                        response = do_http_request(url, method, headers, payload)
                    
                    check_url_counter_key = f"{chaos_report_program['chaosReportProject']}_check_url_counter"
                    check_url_status_code_key = f"{chaos_report_program['chaosReportProject']}_check_url_status_code"
                    check_url_elapsed_time_key = f"{chaos_report_program['chaosReportProject']}_check_url_elapsed_time"
                    check_url_start_time = f"{chaos_report_program['chaosReportProject']}_check_url_start_time"

                    if r.get(check_url_counter_key) == None:
                        r.set(check_url_counter_key, 0)
                    else:
                        r.incr(check_url_counter_key)

                    if r.get(check_url_start_time) == None:
                        r.set(check_url_start_time, now.strftime("%Y-%m-%d %H:%M:%S"))

                    if response == "Connection Error":
                        logging.info(f"[k-inv][metrics_loop][chaos_report] Connection Error while checking {chaos_report_program['chaosReportCheckSiteURL']}")
                        r.set(check_url_status_code_key, "Connection Error")
                        r.set(check_url_elapsed_time_key, 0)
                    else:
                        logging.info(f"[k-inv][metrics_loop][chaos_report] Status code {response.status_code} while checking {chaos_report_program['chaosReportCheckSiteURL']}")
                        r.set(check_url_status_code_key, response.status_code)
                        r.set(check_url_elapsed_time_key, float(response.elapsed.total_seconds()))
    api_response_items = []
    try:
        label_selector="chaos-controller=kubeinvaders"
        api_response = api_instance.list_pod_for_all_namespaces(label_selector=label_selector)
        api_response_items = api_response.items or []
    except ApiException as e:
        logging.warning(f"[k-inv][metrics_loop] Kubernetes API error while listing pods: {e}")
    except LocationValueError as e:
        logging.warning(f"[k-inv][metrics_loop] Invalid Kubernetes host while listing pods: {e}")
        api_instance, batch_api = rebuild_api_client_from_fallbacks(configuration)
    except MaxRetryError as e:
        logging.warning(f"[k-inv][metrics_loop] Kubernetes host unreachable while listing pods: {e}")
        api_instance, batch_api = rebuild_api_client_from_fallbacks(configuration)
    except Exception as e:
        logging.warning(f"[k-inv][metrics_loop] Unexpected error while listing pods: {type(e).__name__}: {e}")

    r.set("current_chaos_job_pod", 0)

    for pod in api_response_items:
        if pod.status.phase == "Pending" or pod.status.phase == "Running":
            logging.debug(f"[k-inv][metrics_loop] Found pod {pod.metadata.name}. It is in {pod.status.phase} phase. Incrementing current_chaos_job_pod Redis key")
            r.incr('current_chaos_job_pod')
        
        if pod.status.phase != "Pending" and pod.status.phase != "Running" and not r.exists(f"pod:time:{pod.metadata.namespace}:{pod.metadata.name}"):
            logging.debug(f"[k-inv][metrics_loop] Found pod {pod.metadata.name}. It is in {pod.status.phase} phase. Tracking time in pod:time:{pod.metadata.namespace}:{pod.metadata.name} Redis key")
            r.set(f"pod:time:{pod.metadata.namespace}:{pod.metadata.name}", int(time.time()))

        elif pod.status.phase != "Pending" and pod.status.phase != "Running" and r.exists(f"pod:time:{pod.metadata.namespace}:{pod.metadata.name}"):
            logging.debug(f"[k-inv][metrics_loop] Found pod {pod.metadata.name}. It is in {pod.status.phase} phase. Comparing time in pod:time:{pod.metadata.namespace}:{pod.metadata.name} Redis key with now")
            now = int(time.time())
            pod_time = int(r.get(f"pod:time:{pod.metadata.namespace}:{pod.metadata.name}"))
            logging.debug(f"[k-inv][metrics_loop] For {pod.metadata.name} comparing now:{now} with pod_time:{pod_time}")
            if (now - pod_time > 120):
                try:
                    api_instance.delete_namespaced_pod(pod.metadata.name, namespace = pod.metadata.namespace)
                    logging.debug(f"[k-inv][metrics_loop] Deleting pod {pod.metadata.name}")
                    r.delete(f"pod:time:{pod.metadata.namespace}:{pod.metadata.name}")
                except ApiException as e:
                    logging.debug(e)
        if pod.metadata.labels.get('chaos-codename') != None:
            codename = pod.metadata.labels.get('chaos-codename')
            job_name = pod.metadata.labels.get('job-name').replace("-","_")
            exp_name = pod.metadata.labels.get('experiment-name')
            if pod.status.phase in ["Pending", "Running", "Succeeded"]:
                r.set(f"chaos_jobs_status:{codename}:{exp_name}:{job_name}", 1.0)
            else:
                r.set(f"chaos_jobs_status:{codename}:{exp_name}:{job_name}", -1)
            r.set(f"chaos_jobs_pod_phase:{codename}:{exp_name}:{job_name}", pod.status.phase)
    time.sleep(1)
