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


# create logger
logging.basicConfig(level=os.environ.get("LOGLEVEL", "INFO"))
logging.info('Starting script for KubeInvaders programming mode')

with open(sys.argv[1], 'r') as stream:
    try:
        parsed_yaml=yaml.safe_load(stream)
        logging.info(f"Parsed yaml => {parsed_yaml}")
    except yaml.YAMLError as exc:
        print(exc)

r = redis.Redis(unix_socket_path='/tmp/redis.sock')

configuration = client.Configuration()
token = os.environ["TOKEN"]
configuration.api_key = {"authorization": f"Bearer {token}"}
configuration.host = sys.argv[2]
configuration.insecure_skip_tls_verify = True
configuration.verify_ssl = False

client.Configuration.set_default(configuration)
client.Configuration.set_default(configuration)

api_instance = client.CoreV1Api()
batch_api = client.BatchV1Api()
namespace = "kubeinvaders"

for job in parsed_yaml["jobs"]:
    logging.info(f"Found job {job}")

for exp in parsed_yaml["experiments"]:
    logging.info(f"Processing the experiment {exp}")
    job_attrs = parsed_yaml["jobs"][exp["job"]]
    args = []
    for arg in job_attrs['args']:
        args.append(str(arg))

    logging.info(f"args = {args}")
    logging.info(f"command = {job_attrs['command']}")

    container = create_container(
        image = job_attrs['image'], 
        name = exp['name'],
        command = [job_attrs['command']],
        args = args
    )
    
    letters = string.ascii_lowercase
    rand_suffix = ''.join(random.choice(letters) for i in range(5))
    job_name = f"{exp['name']}-{rand_suffix}"
    pod_template = create_pod_template(exp["name"], container)
    logging.info(f"Creating job {job_name}")
    job_def = create_job(job_name, pod_template)

    try:
      batch_api.create_namespaced_job('kubeinvaders', job_def)
    except ApiException as e:
        logging.info(e)
        quit()
    
    if r.exists('chaos_node_jobs_total') == 1:
      r.incr('chaos_node_jobs_total')
    else:
      r.set("chaos_node_jobs_total", 1)

os.remove(sys.argv[1])
