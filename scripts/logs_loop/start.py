from asyncio.log import logger
import yaml
import logging
import os
import pathlib
import sys
from kubernetes import client, config
from kubernetes.client.rest import ApiException
import requests
from string import Template
import string
import random
import redis
import time
import re

file = pathlib.Path('/tmp/redis.sock')
if file.exists():
    r = redis.Redis(unix_socket_path='/tmp/redis.sock', charset="utf-8", decode_responses=True)
else:
    r = redis.Redis("127.0.0.1", charset="utf-8", decode_responses=True)

# create logger
logging.basicConfig(level=os.environ.get("LOGLEVEL", "INFO"))
logging.info('Starting script for KubeInvaders programming mode')

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
    pods_items = []
    if r.exists("log_pod_regex"):
        log_pod_regex = r.get("log_pod_regex")
        try:
            api_response = api_instance.list_pod_for_all_namespaces()
        except ApiException as e:
            logging.info(e)

        for pod in api_response.items:
            if re.search(log_pod_regex, pod.metadata.name):
                pods_items.append(pod)

    try:
        api_response = api_instance.list_namespaced_pod(namespace="kubeinvaders")
    except ApiException as e:
        logging.info(e)

    pods_items = pods_items + api_response.items

    for pod in api_response.items:
        if pod.metadata.labels.get('approle') != None and pod.metadata.labels['approle'] == 'chaosnode' and pod.status.phase != "Pending":
            try:
                logging.info(f"Reading logs of {pod.metadata.name}")
                api_response = api_instance.read_namespaced_pod_log(name=pod.metadata.name, namespace='kubeinvaders')
                logrow = f"<div class='row'><div style='margin-top: 2%; background-color:#400075; color: #e9f0ef; text-align: center;' class='alert' role='alert'>Pod Name: {pod.metadata.name} (Log TTL: 30sec)</div><div style='margin-top: 1.5px; background-color:#000000; color: #e9f0ef; font-size: 12px; font-family: Courier New, Courier, monospace;' class='alert' role='alert'>{api_response}</div></div>"
                r.set(f"log:{pod.metadata.name}", logrow)
                r.expire(f"log:{pod.metadata.name}", 30)
                logging.info(f"Phase of {pod.metadata.name} is {pod.status.phase}")   
                if pod.status.phase == "Succeeded":
                    try:
                        api_response = api_instance.delete_namespaced_pod(pod.metadata.name, namespace='kubeinvaders')
                        logging.info(f"Deleted pod {pod.metadata.name}")
                    except ApiException as e:
                        logging.info(e)
            except ApiException as e:
                logging.info(e)
    file = pathlib.Path('/var/www/html')
    if file.exists():
        log_html_file = pathlib.Path('/var/www/html/chaoslogs.html')
        if log_html_file.exists():
            with open("/var/www/html/chaoslogs.html", "w") as myfile:
                myfile.write('')
        for key in r.scan_iter("log:*"):
            with open("/var/www/html/chaoslogs.html", "a") as myfile:
                myfile.write(str(r.get(key)))
    time.sleep(1)
