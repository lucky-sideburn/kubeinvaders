from asyncio.log import logger
import yaml
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
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def create_container(image, name, command, args):
    container = client.V1Container(
        image=image,
        name=name,
        image_pull_policy='IfNotPresent',
        args=args,
        command=command,
    )

    logging.info(
        f"Created container with name: {container.name}, "
        f"image: {container.image} and args: {container.args}"
    )

    return container

def create_pod_template(pod_name, container):
    pod_template = client.V1PodTemplateSpec(
        spec=client.V1PodSpec(restart_policy="Never", containers=[container]),
        metadata=client.V1ObjectMeta(name=pod_name, labels={"pod_name": pod_name, "approle": "chaosnode"}),
    )

    return pod_template

def create_job(job_name, pod_template):
    metadata = client.V1ObjectMeta(name=job_name, labels={"job_name": job_name, "approle": "chaosnode"})

    job = client.V1Job(
        api_version="batch/v1",
        kind="Job",
        metadata=metadata,
        spec=client.V1JobSpec(backoff_limit=0, template=pod_template),
    )
    #logger.info(job)
    return job


r = redis.Redis(unix_socket_path='/tmp/redis.sock')

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

while True:
    try:
        api_response = api_instance.list_namespaced_pod(namespace="kubeinvaders")
        #logging.info(api_response)
    except ApiException as e:
        logging.info(e)

    r.set("current_chaos_job_pod", 0)

    for pod in api_response.items:
        if pod.metadata.labels.get('approle') != None and pod.metadata.labels['approle'] == 'chaosnode':
            logging.info(pod.status.phase)
            if pod.status.phase == "Pending" or pod.status.phase == "Running":
                r.incr('current_chaos_job_pod')
    time.sleep(1)
