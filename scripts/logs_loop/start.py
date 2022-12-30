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
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def compute_line(api_response_line, api_instance, container):
    #api_response_line = api_response_line.encode('utf-8', 'xmlcharrefreplace')
    logging.info(f"[logid:{logid}] API Response: ||{api_response_line}||")
    logrow = f"<div class='row' style='margin-top: 2%; color: #1d1919;'><div class='row' style='font-size: 12px'>-----------------------</div><div class='row' style='font-size: 12px'>Namespace:&nbsp;{pod.metadata.namespace}</div><div class='row' style='font-size: 12px'>Pod:&nbsp;{pod.metadata.name}</div><div class='row' style='font-size: 12px'>Container:&nbsp;{container}</div></div><div class='row' style='margin-top: 0.5%; color: #444141; font-size: 12px; font-family: Courier New, Courier, monospace;'>>>>{api_response_line}</div>"
    #store = False
    sha256log = sha256(logrow.encode('utf-8')).hexdigest()

    if not r.exists(f"log:{logid}:{pod.metadata.name}:{sha256log}"):
        logging.info(f"[logid:{logid}] The key log:{logid}:{pod.metadata.name}:{sha256log} does not exists. Preparing to store log content")
        file = pathlib.Path('/var/www/html')
        if file.exists():
            log_html_file = pathlib.Path(f"/var/www/html/chaoslogs-{logid}.html")
            line_prepender(log_html_file, logrow, logid)

    r.set(f"log:{logid}{pod.metadata.name}:{sha256log}", logrow)
    r.set(f"log_time:{logid}:{pod.metadata.name}", time.time())
    r.expire(f"log:{logid}:{pod.metadata.name}:{sha256log}", 10)

    logging.info(f"[logid:{logid}] Phase of {pod.metadata.name} is {pod.status.phase}")   
    if pod.status.phase == "Succeeded" and pod.metadata.labels['approle'] == 'chaosnode':
        try:
            api_instance.delete_namespaced_pod(pod.metadata.name, namespace = pod.metadata.namespace)
            logging.info(f"[logid:{logid}] Deleted pod {pod.metadata.name}")
        except ApiException as e:
            logging.info(e)


def line_prepender(filename, line, logid):
    logging.info(f"[logid:{logid}] Entering in line_prepender function")
    log_html_file = pathlib.Path(filename)
    if not log_html_file.exists():
        logging.info(f"[logid:{logid}] {log_html_file} does not exists. Going to reset Redis keys")
        with open(log_html_file, "w") as myfile:
            logging.info(f"[logid:{logid}] {log_html_file.exists} does not exists. Create new blank file {log_html_file}")
            myfile.write('')
        for key in r.scan_iter(f"log_time:{logid}:*"):
            logging.info(f"[logid:{logid}] Delete key {key}")
            r.delete(key)
        for key in r.scan_iter(f"log:{logid}:*"):
            logging.info(f"[logid:{logid}] Delete key {key}")
            r.delete(key)
    try:
        with open(filename, 'r+') as f:
            logging.info(f"[logid:{logid}] Insert in the head of {filename} the line: {line}")
            content = f.read()
            f.seek(0, 0)
            f.write(line.rstrip('\r\n') + '\n' + content)
    except:
        logging.info(f"[logid:{logid}] Some i/o problem occurred in function line_prepender")

# create logger
logging.basicConfig(level=logging.INFO)
#logging.basicConfig(filename='/tmp/example.log', encoding='utf-8', level=os.environ.get("LOGLEVEL", "INFO"))

logging.info('Starting script for KubeInvaders taking logs from pods...')

file = pathlib.Path('/tmp/redis.sock')

if file.exists():
    r = redis.Redis(unix_socket_path='/tmp/redis.sock', charset="utf-8", decode_responses=True)
else:
    r = redis.Redis("127.0.0.1", charset="utf-8", decode_responses=True)

if os.environ.get("DEV"):
    logging.info("Setting env var for dev...")
    r.set("log_pod_regex", '{"pod":".*", "namespace":"namespace1", "labels":".*", "annotations":".*", "containers": ".*"}')
    r.set("logs_enabled:aaaa", 1)
    r.expire("logs_enabled:aaaa", 10)
    r.set("programming_mode", 0)
    logging.info(r.get("log_pod_regex:aaaa"))
    logging.info(r.get("logs_enabled:aaaa"))

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

if not r.exists("programming_mode"):
    r.set("programming_mode", 0)

while True:
    logging.info(f"Looking for Redis keys logs_enabled:*")
    for key in r.scan_iter("logs_enabled:*"):
        if r.get(key) == "1":

            logging.info(f"Found key {key} and it is enabled!")
            logid = key.split(":")[1]

            if r.exists(f"log_pod_regex:{logid}"):
                logging.info(f"[logid:{logid}] The Redis key log_pod_regex exists...")
            else:
                logging.info(f"[logid:{logid}] The Redis key log_pod_regex does NOT exists...")
                r.set(f"log_pod_regex:{logid}", '{"pod":".*", "namespace":".*", "labels":".*", "annotations":".*", "containers": ".*"}')

            if r.exists(f"logs_enabled:{logid}"):
                logging.info(f"[logid:{logid}] The Redis key logs_enabled exists...")
            else:
                logging.info(f"[logid:{logid}] The Redis key logs_enabled does NOT exists...")

            logging.info(f"[logid:{logid}] Checking log_cleaner Redis key")

            if not r.exists(f"log_cleaner:{logid}"):
                logging.info(f"[logid:{logid}] The key log_cleaner:{logid} does not exists")
                if pathlib.Path(f"/var/www/html/chaoslogs-{logid}.html").exists():
                    logging.info(f"[logid:{logid}] Remove /var/www/html/chaoslogs-{logid}.html")
                    os.remove(f"/var/www/html/chaoslogs-{logid}.html")
                r.set(f"log_cleaner:{logid}", "1")
                r.expire(f"log_cleaner:{logid}", 10)
            else:
                logging.info(f"[logid:{logid}] The key log_cleaner:{logid} esists. Clean /var/www/html/chaoslogs-{logid}.html is not needed")

            logging.info(f"Loop iteration for log id {logid}")

            file = pathlib.Path(f"/var/www/html/chaoslogs-{logid}.html")

            if not file.exists():
                for key in r.scan_iter(f"log:{logid}:*"):
                    r.delete(key)

            webtail_pods = []
            final_pod_list = []
            if r.exists(f"log_pod_regex:{logid}") and r.exists(f"logs_enabled:{logid}") and r.get("programming_mode") == "0":
                logging.info(f"[logid:{logid}] Found Redis keys for log tail")
                if r.get(f"logs_enabled:{logid}") == "1":
                    logging.info(f"[logid:{logid}] Found regex log_pod_regex in Redis. Logs from all pods should be collected")

                    log_pod_regex = r.get(f"log_pod_regex:{logid}")

                    logging.info(f"[logid:{logid}] log_pod_regex is => |{log_pod_regex}|")

                    try:
                        api_response = api_instance.list_pod_for_all_namespaces()
                    except ApiException as e:
                        logging.info(e)
                    logging.info(f"[logid:{logid}] Going to search pod compliant with the regex on {len(api_response.items)} pods")

                    json_re = json.loads(log_pod_regex)
                    pod_re = json_re["pod"]
                    namespace_re = json_re["namespace"]
                    annotations_re = json_re["annotations"]
                    labels_re = json_re["labels"]
                    containers_re = json_re["containers"]

                    logging.info(f"[logid:{logid}] Gobal Json Regex is {json_re}")
                    logging.info(f"[logid:{logid}] Regex for pod name is {pod_re}")
                    logging.info(f"[logid:{logid}] Regex namespace name {namespace_re}")
                    logging.info(f"[logid:{logid}] Regex for labels is {labels_re}")
                    logging.info(f"[logid:{logid}] Regex for annotation is {annotations_re}")

                    for pod in api_response.items:
                        if re.search(f"{pod_re}", pod.metadata.name) and re.search(f"{namespace_re}", pod.metadata.namespace) and re.search(f"{labels_re}", str(pod.metadata.labels)) and re.search(f"{annotations_re}", str(pod.metadata.annotations)):
                            webtail_pods.append(pod)
                            #logging.info(f"[logid:{logid}] Taking log of {pod.metadata.name} because it is compliant with the regex {log_pod_regex}")

            try:
                api_response = api_instance.list_namespaced_pod(namespace="kubeinvaders")
            except ApiException as e:
                logging.info(e)

            webtail_switch = False

            if  r.get("programming_mode") == "0":
                final_pod_list = webtail_pods
                if len(webtail_pods) > 0:
                    webtail_switch = True
            else:
                final_pod_list = api_response.items

            for pod in final_pod_list:
                container_list = []
                for container in pod.spec.containers:
                    if re.search(f"{containers_re}", container.name):
                        container_list.append(container.name)

                for container in container_list:
                    if webtail_switch or (pod.metadata.labels.get('approle') != None and pod.metadata.labels['approle'] == 'chaosnode' and pod.status.phase != "Pending"):
                        try:
                            latest_log_tail = r.get(f"log_time:{pod.metadata.name}")
                            #logging.info(f"[logid:{logid}] Reading logs of {pod.metadata.name} on {pod.metadata.namespace}")
                            
                            if r.exists(f"log_time:{logid}:{pod.metadata.name}"):
                                latest_log_tail_time = r.get(f"log_time:{logid}:{pod.metadata.name}")
                            else:
                                latest_log_tail_time = time.time()
                            #logging.info(f"[logid:{logid}] Latest latest_log_tail for {pod.metadata.name} is {latest_log_tail_time}. Current Unix Time is {time.time()}")

                            since = int(time.time() - float(latest_log_tail_time)) + 1

                            #logging.info(f"[logid:{logid}] Diff from time.time() and latest_log_tail_time for {pod.metadata.name} is {since}")

                            if since == 0:
                                since = 1

                            api_response = api_instance.read_namespaced_pod_log(name=pod.metadata.name, namespace=pod.metadata.namespace, since_seconds=since, container=container)
                            r.set(f"log_time:{logid}:{pod.metadata.name}", time.time())

                            if api_response == "":
                                continue

                            if type(api_response) is list:
                                for api_response_line in api_response:
                                    compute_line(api_response_line, api_instance, container)
                            else:
                                for api_response_line in api_response.splitlines():
                                    compute_line(api_response_line, api_instance, container)

                        except ApiException as e:
                            logging.info(e)
    time.sleep(1)
