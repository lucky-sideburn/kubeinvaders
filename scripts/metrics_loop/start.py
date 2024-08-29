from asyncio.log import logger
import yaml
import json
import logging
import os
import sys
from kubernetes import client, config
from kubernetes.client.rest import ApiException
import requests
from string import Template
import string
import random
import redis
import time
import urllib3
import time
import datetime
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def join_string_to_array(project_list_string, separator):
    return project_list_string.split(separator)

def do_http_request(url, method, headers, data):
    try:
        response = requests.request(method, url, headers=headers, data=data, verify=False, allow_redirects=True, timeout=10)
        elaped_time = response.elapsed.total_seconds()
        return response
    except requests.exceptions.RequestException as e:
        logging.error(f"Error while sending HTTP request: {e}")
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

logging.basicConfig(level=os.environ.get("LOGLEVEL", "INFO"))
logging.getLogger('kubernetes').setLevel(logging.ERROR)

logging.debug('Starting script for KubeInvaders metrics loop')

configuration = client.Configuration()
token = os.environ["TOKEN"]
configuration.api_key = {"authorization": f"Bearer {token}"}
configuration.host = sys.argv[1]

configuration.insecure_skip_tls_verify = True
configuration.verify_ssl = False

client.Configuration.set_default(configuration)
client.Configuration.set_default(configuration)

api_instance = client.CoreV1Api()
batch_api = client.BatchV1Api()

while True:
    #logging.info(f"[k-inv][metrics_loop] Metrics loop is active - {r.exists('chaos_report_project_list')}")
    if r.exists('chaos_report_project_list'):
        #logging.info("[k-inv][metrics_loop] Found chaos_report_project_list Redis Key")
        for project in join_string_to_array(r.get('chaos_report_project_list').decode(), ','):
            #logging.info(f"[k-inv][metrics_loop] Computing Chaos Report Project: {project}")
            chaos_program_key = f"chaos_report_project_{project}"
            if r.exists(chaos_program_key):
                #logging.info(f"[k-inv][metrics_loop][chaos_report] Found chaos_report_project_{project} key in Redis. Starting {project} ")

                if check_if_json_is_valid(r.get(chaos_program_key)):
                    chaos_report_program = json.loads(r.get(chaos_program_key))
                    now = datetime.datetime.now()

                    #logging.info(f"[k-inv][metrics_loop][chaos_report] chaos_report_program is valid JSON: {chaos_report_program}")
                    response = do_http_request(chaos_report_program['chaosReportCheckSiteURL'], chaos_report_program['chaosReportCheckSiteURLMethod'], json.loads(chaos_report_program['chaosReportCheckSiteURLHeaders']), chaos_report_program['chaosReportCheckSiteURLPayload'])
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
                        #logging.info(f"[k-inv][metrics_loop][chaos_report] Connection Error while checking {chaos_report_program['chaosReportCheckSiteURL']}")
                        r.set(check_url_status_code_key, "Connection Error")
                        r.set(check_url_elapsed_time_key, 0)
                    else:
                        #logging.info(f"[k-inv][metrics_loop][chaos_report] Status code {response.status_code} while checking {chaos_report_program['chaosReportCheckSiteURL']}")
                        r.set(check_url_status_code_key, response.status_code)
                        r.set(check_url_elapsed_time_key, float(response.elapsed.total_seconds()))
    try:
        label_selector="chaos-controller=kubeinvaders"
        api_response = api_instance.list_pod_for_all_namespaces(label_selector=label_selector)
    except ApiException as e:
        logging.debug(e)

    r.set("current_chaos_job_pod", 0)

    for pod in api_response.items:
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
