from asyncio.log import logger
import yaml
import logging
import os
import pathlib
import sys
import json
from kubernetes import client, config
from kubernetes.client.rest import ApiException
import requests
from string import Template
import string
import random
import redis
import time
import re
from hashlib import sha256
import time
import urllib3
import datetime
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def create_pod_list(logid, api_responses, current_regex):
    webtail_pods = []
    json_re = json.loads(current_regex)
    regexsha = sha256(current_regex.encode('utf-8')).hexdigest()
    pod_re = json_re["pod"]
    namespace_re = json_re["namespace"]
    annotations_re = json_re["annotations"]
    labels_re = json_re["labels"]
    containers_re = json_re["containers"]
    
    for api_response in api_responses:    
        pods_pending = 0
        pods_running = 0
        pods_succeeded = 0

        for pod in api_response.items:
            if pod.status.phase == "Pending":
                pods_pending = pods_pending + 1
            if pod.status.phase == "Running":
                pods_running = pods_running + 1
            if pod.status.phase == "Succeeded":
                pods_succeeded = pods_succeeded + 1

            r.set(f"log_status:{logid}", f"Pods on Pending phase: {pods_pending}\nPods on Succeeded phase: {pods_succeeded}\nPods on Running phase: {pods_running}")

            # old_logs = r.get(f"logs:chaoslogs-{logid}")
            # r.set(f"logs:chaoslogs-{logid}", f"<hr/>[k-inv] pods on Pending phase: {pods_pending}<hr/>[k-inv] pods on Succeeded phase: {pods_succeeded}<hr/>[k-inv] pods on Running phase: {pods_running}<hr/>{old_logs}") 
            
            # if pod.status.phase != "Succedeed" and pod.status.phase != "Running":
            #     continue

            if r.exists(f"regex_cmp:{regexsha}:{logid}:{pod.metadata.namespace}:{pod.metadata.name}"):
                cached_regex_match = r.get(f"regex_cmp:{regexsha}:{logid}:{pod.metadata.namespace}:{pod.metadata.name}")
                if cached_regex_match == "maching":
                    webtail_pods.append(pod)
                    regex_match_info = f"[logid:{logid}][k-inv][logs-loop] Taking logs of {pod.metadata.name}. Redis has cached that {current_regex} is good for {pod.metadata.name}"
                    logging.debug(f"[k-inv][regexmatch][logid:{logid}][{cached_regex_match}] IS CHACHED IN REDIS")

                else:
                    regex_match_info = f"[logs-loop][logid:{logid}] Skipping logs of {pod.metadata.name}. Redis has cached that {current_regex} is not good for {pod.metadata.name}"
                    logging.debug(regex_match_info)
                    logging.debug(f"[k-inv][regexmatch][logid:{logid}][{cached_regex_match}] IS CHACHED IN REDIS")

            else:
                if re.search(f"{pod_re}", pod.metadata.name) or re.search(r"{pod_re}", pod.metadata.name):
                    #logging.debug(f"[logid:{logid}][k-in][regexmatch] |{pod_re}| |{pod.metadata.name}| MATCHED")
                    regex_key_name = f"regex_cmp:{regexsha}:{logid}:{pod.metadata.namespace}:{pod.metadata.name}"

                    if re.search(f"{namespace_re}", pod.metadata.namespace) or re.search(r"{namespace_re}", pod.metadata.namespace):
                        #logging.debug(f"[logid:{logid}][k-inv][regexmatch] |{namespace_re}| |{pod.metadata.namespace}| MATCHED")
                        if re.search(f"{labels_re}", str(pod.metadata.labels)) or re.search(r"{labels_re}", str(pod.metadata.labels)):
                            logging.debug(f"[logid:{logid}][k-inv][regexmatch] |{labels_re}| |{str(pod.metadata.labels)}| MATCHED")
                            if re.search(f"{annotations_re}", str(pod.metadata.annotations)) or re.search(r"{annotations_re}", str(pod.metadata.annotations)):
                                logging.debug(f"[logid:{logid}][k-inv][regexmatch] |{annotations_re}| |{str(pod.metadata.annotations)}| MATCHED")
                                webtail_pods.append(pod)
                                regex_match_info = f"[logid:{logid}] Taking logs from {pod.metadata.name}. It is compliant with the Regex {current_regex}"
                                r.set(regex_key_name, "maching")
                                logging.debug(regex_match_info)
                                #r.set(f"log_status:{logid}", regex_match_info)
                            else:
                                logging.debug(f"[logid:{logid}][k-inv][regexmatch] |{annotations_re}| |{str(pod.metadata.annotations)}| FAILED")
                                r.set(regex_key_name, "not_maching")
                        else:
                            logging.debug(f"[logid:{logid}][k-inv][regexmatch] |{labels_re}| |{str(pod.metadata.labels)}| FAILED")
                            r.set(regex_key_name, "not_maching")
                    else:
                        logging.debug(f"[logid:{logid}][k-inv][regexmatch] |{namespace_re}| |{pod.metadata.namespace}| FAILED")
                        r.set(regex_key_name, "not_maching")
                else:
                    logging.debug(f"[logid:{logid}][k-inv][regexmatch] |{pod_re}| |{pod.metadata.name}| FAILED")
                    r.set(regex_key_name, "not_maching")
    return webtail_pods
                            
def log_cleaner(logid):
    if not r.exists(f"do_not_clean_log:{logid}"):

        for key in r.scan_iter(f"log_time:{logid}:*"):
            r.delete(key)
        for key in r.scan_iter(f"log:{logid}:*"):
                r.delete(key)
        r.set(f"do_not_clean_log:{logid}", "1")
        r.expire(f"do_not_clean_log:{logid}", 60)
        r.set(f"log_status:{logid}", f"[k-inv][logs-loop] Logs (id: {logid}) has been cleaned")

def get_regex(logid):
    if not r.exists(f"log_pod_regex:{logid}"):
        r.set(f"log_status:{logid}", f"[k-inv][logs-loop] ERROR. Regex has not been configured or is invalid")
    return r.get(f"log_pod_regex:{logid}")

def compute_line(api_response_line, container):
    logging.debug(f"[logid:{logid}] API Response: ||{api_response_line}||")
    logrow = f"""
<div class='row' style='margin-top: 2%; color: #1d1919;'>
    <div class='row' style='font-size: 12px'>
        <hr/>
    </div>
    <div class='row log-title'>
        <div class='col'>Namespace</div>
        <div class='col'>Pod</div>
        <div class='col'>Container</div>
    </div>
    <div class='row'>
        <div class='col'>
            <span class="badge rounded-pill alert-logs-namespace">
                {pod.metadata.namespace}
            </span>
        </div>
        <div class='col'>
            <span class="badge rounded-pill alert-logs-pod">
                {pod.metadata.name}
            </span>
        </div>
        <div class='col'>
            <span class="badge rounded-pill alert-logs-container">
                {container}
            </span>
        </div>
    </div>
</div>
<div class='row log-row'>
    {api_response_line}
</div>
"""
    sha256log = sha256(logrow.encode('utf-8')).hexdigest()

    if not r.exists(f"log:{logid}:{pod.metadata.name}:{container}:{sha256log}"):
        logging.debug(f"[logid:{logid}][k-inv][logs-loop] The key log:{logid}:{pod.metadata.name}:{container}:{sha256log} does not exists. Preparing to store log content")
        old_rows = r.get(f"logs:chaoslogs-{logid}")
        logrow = f"{logrow}\n{old_rows}"
        r.set(f"logs:chaoslogs-{logid}", logrow)

    r.set(f"log:{logid}:{pod.metadata.name}:{container}:{sha256log}", logrow)
    r.set(f"log_time:{logid}:{pod.metadata.name}:{container}", time.time())
    r.expire(f"log:{logid}:{pod.metadata.name}:{container}:{sha256log}", 60)

logging.basicConfig(level=os.environ.get("LOGLEVEL", "INFO"))
logging.getLogger('kubernetes').setLevel(logging.ERROR)

logging.debug('Starting script for KubeInvaders taking logs from pods...')

file = pathlib.Path('/tmp/redis.sock')

if file.exists():
    r = redis.Redis(unix_socket_path='/tmp/redis.sock', charset="utf-8", decode_responses=True)
else:
    r = redis.Redis("127.0.0.1", charset="utf-8", decode_responses=True)

if os.environ.get("DEV"):
    logging.debug("Setting env var for dev...")
    r.set("log_pod_regex", '{"since": 60, "pod":".*", "namespace":"namespace1", "labels":".*", "annotations":".*", "containers": ".*"}')
    r.set("logs_enabled:aaaa", 1)
    r.expire("logs_enabled:aaaa", 10)
    r.set("programming_mode", 0)
    logging.debug(r.get("log_pod_regex:aaaa"))
    logging.debug(r.get("logs_enabled:aaaa"))

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
namespace = "kubeinvaders"

while True:
    for key in r.scan_iter("logs_enabled:*"):
        if r.get(key) == "1":
            logid = key.split(":")[1]
            logging.debug(f"Found key {key} and it is enabled.")
            webtail_pods = []
            current_regex = get_regex(logid)

            if not current_regex:
                continue
            else:
                logging.debug(f"log_status:{logid}", f"[k-inv][logs-loop] {key} is using this regex: {current_regex}")

            logging.debug(f"[logid:{logid}] Checking do_not_clean_log Redis key")
            log_cleaner(logid)

            try:
                json_re = json.loads(current_regex)
                namespace_re = json_re["namespace"]
                logging.debug(f"[logid:{logid}][k-inv][logs-loop] Taking list of namespaces")
                namespaces_list = api_instance.list_namespace()
                api_responses = []

                for namespace in namespaces_list.items:
                    #logging.debug(f"[logid:{logid}][k-inv][logs-loop] Found namespace {namespace.metadata.name}")
                    if re.search(f"{namespace_re}", namespace.metadata.name):
                        logging.debug(f"[logid:{logid}][k-inv][logs-loop][NAMESPACE-MATCHING] {namespace.metadata.name}")
                        logging.debug(f"[logid:{logid}][k-inv][logs-loop] Taking pods from namespace {namespace.metadata.name}")
                        api_responses.append(api_instance.list_namespaced_pod(namespace.metadata.name))

            except ApiException as e:
                logging.debug(e)
            
            #pods_found_info = f"[logid:{logid}][k-inv][logs-loop] Looking for pods compliant with the current regex. Scanning {len(api_response.items)} pods"
            #r.set(f"log_status:{logid}", pods_found_info)

            webtail_pods = create_pod_list(logid, api_responses, current_regex)
            json_re = json.loads(current_regex)
            containers_re = json_re["containers"]
            webtail_pods_len = len(webtail_pods)
            old_logs = r.get(f"logs:chaoslogs-{logid}")
            user_since = int(json_re["since"])


            # if r.exists(f"logs:webtail_pods_len:{logid}") and str(r.get(f"logs:webtail_pods_len:{logid}")) != str(webtail_pods_len):
            #     r.set(f"logs:chaoslogs-{logid}", f"<br> [k-inv] K-inv found {webtail_pods_len} pods to read logs from <br> {old_logs}")

            r.set(f"logs:webtail_pods_len:{logid}", webtail_pods_len)
            r.set(f"pods_match_regex:{logid}", webtail_pods_len)
            logging.debug(f"[logid:{logid}][k-inv][logs-loop] Current Regex: {current_regex}")
            
            for pod in webtail_pods:
                if pod.status.phase == "Unknown" and pod.status.phase == "Pending":
                    continue
                logging.debug(f"[logid:{logid}][k-inv][logs-loop] Taking logs from {pod.metadata.name}")
                container_list = []
                for container in pod.spec.containers:
                    # if "containers_re" in locals() or "containers_re" in globals():
                    #     if re.search(f"{containers_re}", container.name):
                    container_list.append(container.name)
                
                if len(container_list) == 1:
                    only_one_container = True
                else:
                    only_one_container = False

                for container in container_list:
                    logging.debug(f"[logid:{logid}][k-inv][logs-loop] Listing containers of {pod.metadata.name}. Computing {container} phase: {pod.status.phase}")
                    if pod.status.phase != "Unknown" and pod.status.phase != "Pending":
                        logging.debug(f"[logid:{logid}][k-inv][logs-loop] Container {container} on pod {pod.metadata.name} has accepted phase for taking logs")
                        try:
                            if r.exists(f"log_time:{logid}:{pod.metadata.name}:{container}"):
                                latest_log_tail_time = float(r.get(f"log_time:{logid}:{pod.metadata.name}:{container}"))
                                since = int(time.time() - float(latest_log_tail_time)) + 1

                            else:
                                latest_log_tail_time = time.time()
                                pod_start_time = int(datetime.datetime.timestamp(pod.status.start_time))
                                logging.debug(f"[logid:{logid}][k-inv][logs-loop] POD's start time {pod_start_time}")
                                since = int(time.time() - pod_start_time) + 1
                            
                            logging.debug(f"[logid:{logid}][k-inv][logs-loop] user_since is {user_since}")

                            if since > user_since:
                                continue

                            logging.debug(f"[logid:{logid}][k-inv][logs-loop] Time types: {type(latest_log_tail_time)} {type(time.time())} {type(since)} since={since}")                    
                            logging.debug(f"[logid:{logid}][k-inv][logs-loop] Calling K8s API for reading logs of {pod.metadata.name} container {container} in namespace {pod.metadata.namespace} since {since} seconds - phase {pod.status.phase}")

                            if only_one_container:
                                api_response = api_instance.read_namespaced_pod_log(name=pod.metadata.name, namespace=pod.metadata.namespace, since_seconds=since)
                            else:
                                api_response = api_instance.read_namespaced_pod_log(name=pod.metadata.name, namespace=pod.metadata.namespace, since_seconds=since, container=container)

                            logging.debug(f"[logid:{logid}][k-inv][logs-loop] Computing K8s API response for reading logs of {pod.metadata.name} in namespace {pod.metadata.namespace} - phase {pod.status.phase}")
                            logging.debug(f"[logid:{logid}][k-inv][logs-loop] {type(api_response)} {api_response}")

                            r.set(f"log_time:{logid}:{pod.metadata.name}:{container}", time.time())

                            # k = 5
                            
                            # regex_return = re.search(r'[\w]+', api_response)
                            # logging.debug(f"[logid:{logid}][k-inv][logs-loop] Regex on api_response: {regex_return}")

                            # while not re.search(r'[\w]+', api_response) and k < 60:
                            #     logging.debug(f"[logid:{logid}][k-inv][logs-loop][logs collector attempt {k}] Calling K8s API for reading logs of {pod.metadata.name} container {container} in namespace {pod.metadata.namespace} since {since} seconds - phase {pod.status.phase}")
                            #     if only_one_container:
                            #         api_response = api_instance.read_namespaced_pod_log(name=pod.metadata.name, namespace=pod.metadata.namespace, since_seconds=since)
                            #     else:
                            #         api_response = api_instance.read_namespaced_pod_log(name=pod.metadata.name, namespace=pod.metadata.namespace, since_seconds=since, container=container)
                            #     logging.debug(f"[logid:{logid}][k-inv][logs-loop] API Response: {api_response}")
                            #     # regex_return = re.search(r'[\w]+', api_response)
                            #     # logging.debug(f"[logid:{logid}][k-inv][logs-loop] Regex on api_response: {regex_return}")

                            #     since = since + 1
                            #     k = k + 1
                            #     time.sleep(0.5)
                            
                            if not re.search(r'[\w]+', api_response):
                                # regex_return = re.search(r'[\w]+', api_response)
                                # logging.debug(f"[logid:{logid}][k-inv][logs-loop] Regex on api_response: {regex_return}")
                                logging.debug(f"[logid:{logid}][k-inv][logs-loop] API Response for reading logs of {pod.metadata.name} in namespace {pod.metadata.namespace} is still empty")
                                continue

                            compute_line(api_response, container)
                            
                            logs = ""

                            if type(api_response) is list:
                                for api_response_line in api_response:
                                    #compute_line(api_response_line, container)
                                    logging.debug(f"[logid:{logid}][k-inv][logs-loop] Computing log line {api_response_line}")
                                    logs = f"{logs}</br>{api_response_line}"
                            else:
                                for api_response_line in api_response.splitlines():
                                    logging.debug(f"[logid:{logid}][k-inv][logs-loop] Computing log line {api_response_line}")
                                    #compute_line(api_response_line, container)
                                    logs = f"{logs}</br>{api_response_line}"

                            compute_line(logs, container)

                        except ApiException as e:
                            logging.debug(f"[k-inv][logs-loop] EXCEPTION {e}")
    time.sleep(1)
