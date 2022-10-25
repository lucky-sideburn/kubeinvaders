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

def line_prepender(filename, line):
    log_html_file = pathlib.Path(filename)
    if not log_html_file.exists():
        with open(log_html_file, "w") as myfile:
            myfile.write('')
        for key in r.scan_iter("log_time:*"):
            r.delete(key)
        for key in r.scan_iter("log:*"):
            r.delete(key)
    with open(filename, 'r+') as f:
        content = f.read()
        f.seek(0, 0)
        f.write(line.rstrip('\r\n') + '\n' + content)

# create logger
logging.basicConfig(level=os.environ.get("LOGLEVEL", "INFO"))
logging.info('Starting script for KubeInvaders taking logs from pods...')

file = pathlib.Path('/tmp/redis.sock')

if file.exists():
    r = redis.Redis(unix_socket_path='/tmp/redis.sock', charset="utf-8", decode_responses=True)
else:
    r = redis.Redis("127.0.0.1", charset="utf-8", decode_responses=True)

if os.environ.get("DEV"):
    logging.info("Setting env var for dev...")
    r.set("log_pod_regex", ".*")
    r.set("logs_enabled", 1)
    logging.info(r.get("log_pod_regex"))
    logging.info(r.get("logs_enabled"))

if r.exists("log_pod_regex"): 
   logging.info("The Redis key log_pod_regex exists...") 
else:
   logging.info("The Redis key log_pod_regex does NOT exists...")    
   r.set("log_pod_regex", '{"pod":".*", "namespace":".*", "labels":".*", "annotations":".*"}')

if r.exists('logs_enabled'):
   logging.info("The Redis key logs_enabled exists...")
else:
   logging.info("The Redis key logs_enabled does NOT exists...")

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

#for key in r.scan_iter("log:*"):
#    r.delete(key)

while True:
    if not r.exists("log_cleaner"):
        if pathlib.Path("/var/www/html/chaoslogs.html").exists():
            os.remove("/var/www/html/chaoslogs.html")
        r.set(f"log_cleaner", "foobar")
        r.expire(f"log_cleaner", 30)

    logging.info("Loop iteration...")
    file = pathlib.Path('/var/www/html/chaoslogs.html')
    if not file.exists():
        for key in r.scan_iter("log:*"):
            r.delete(key)

    webtail_pods = []
    final_pod_list = []
    if r.exists("log_pod_regex") and r.exists('logs_enabled'):
        logging.info("Found Redis keys for log tail...")
        if r.get("logs_enabled") == "1":
            logging.info("Found regex log_pod_regex in Redis. Logs from all pods should be collected")
            log_pod_regex = r.get("log_pod_regex")
            logging.info(f"log_pod_regex is => |{log_pod_regex}|")
            try:
                api_response = api_instance.list_pod_for_all_namespaces()
            except ApiException as e:
                logging.info(e)
            logging.info(f"Going to search pod compliant with the regex on {len(api_response.items)} pods")

            json_re = json.loads(log_pod_regex)
            pod_re = json_re["pod"]
            namespace_re = json_re["namespace"]
            annotations_re = json_re["annotations"]
            labels_re = json_re["labels"]

            logging.info(f"Gobal Json Regex is #{json_re}")
            logging.info(f"Regex for pod name is #{pod_re}")
            logging.info(f"Regex namespace name #{namespace_re}")
            logging.info(f"Regex for labels is #{labels_re}")
            logging.info(f"Regex for annotation is #{annotations_re}")

            for pod in api_response.items:
                if re.search(f"{pod_re}", pod.metadata.name) and re.search(f"{namespace_re}", pod.metadata.namespace) and re.search(f"{labels_re}", str(pod.metadata.labels)) and re.search(f"{annotations_re}", str(pod.metadata.annotations)):
                    webtail_pods.append(pod)
                    logging.info(f"Taking log of {pod.metadata.name} because it is compliant with the regex {log_pod_regex}")

    try:
        api_response = api_instance.list_namespaced_pod(namespace="kubeinvaders")
    except ApiException as e:
        logging.info(e)

    webtail_switch = False

    final_pod_list = webtail_pods + api_response.items

    if len(webtail_pods) > 0:
        webtail_switch = True

    for pod in final_pod_list:
        if webtail_switch or (pod.metadata.labels.get('approle') != None and pod.metadata.labels['approle'] == 'chaosnode' and pod.status.phase != "Pending"):
            try:
                latest_log_tail = r.get(f"log_time:{pod.metadata.name}")
                logging.info(f"Reading logs of {pod.metadata.name} on {pod.metadata.namespace}")
                
                if r.exists(f"log_time:{pod.metadata.name}"):
                    latest_log_tail_time = r.get(f"log_time:{pod.metadata.name}")
                else:
                    latest_log_tail_time = time.time()
                logging.info(f"Latest latest_log_tail for {pod.metadata.name} is {latest_log_tail_time}. Current Unix Time is {time.time()}")

                since = int(time.time() - float(latest_log_tail_time))

                logging.info(f"Diff from time.time() and latest_log_tail_time for {pod.metadata.name} is {since}")

                if since == 0:
                    since = 1

                api_response = api_instance.read_namespaced_pod_log(name=pod.metadata.name, namespace=pod.metadata.namespace, tail_lines=1, since_seconds=since)

                if api_response == "":
                    continue
                logging.info(f"API Response: {api_response}")
                
                logrow = f"<div class='row' style='margin-top: 2%; color: #400075;'>[namespace:{pod.metadata.namespace}][pod:{pod.metadata.name}]</div><div class='row' style='margin-top: 0.5%; color: #444141; font-family: Courier New, Courier, monospace;'>>>>{api_response}</div>"

                store = False
                sha256log = sha256(logrow.encode('utf-8')).hexdigest()

                if r.exists(f"log:{pod.metadata.name}:{sha256log}"):
                    current_row = r.get(f"log:{pod.metadata.name}:{sha256log}")
                    if current_row != logrow:
                        store = True
                
                if not r.exists(f"log:{pod.metadata.name}:{sha256log}") or store:
                    file = pathlib.Path('/var/www/html')
                    if file.exists():
                        log_html_file = pathlib.Path('/var/www/html/chaoslogs.html')
                        line_prepender(log_html_file, logrow)

                r.set(f"log:{pod.metadata.name}:{sha256log}", logrow)
                r.set(f"log_time:{pod.metadata.name}", time.time())
                r.expire(f"log:{pod.metadata.name}:{sha256log}", 30)

                logging.info(f"Phase of {pod.metadata.name} is {pod.status.phase}")   
                if pod.status.phase == "Succeeded" and pod.metadata.labels['approle'] == 'chaosnode':
                    try:
                        api_response = api_instance.delete_namespaced_pod(pod.metadata.name, namespace = pod.metadata.namespace)
                        logging.info(f"Deleted pod {pod.metadata.name}")
                    except ApiException as e:
                        logging.info(e)
            except ApiException as e:
                logging.info(e)
    time.sleep(0.5)
