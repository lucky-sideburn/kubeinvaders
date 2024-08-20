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
import re

def create_container(image, name, command, args):
    container = client.V1Container(
        image=image,
        name=name,
        image_pull_policy='IfNotPresent',
        args=args,
        command=command,
    )

    logging.info(
        f"[PROGRAMMING_MODE] Created container with name: {container.name}, "
        f"[PROGRAMMING_MODE] Image: {container.image} and Args: {container.args}"
    )
    return container

def create_pod_template(pod_name, additional_labels, container, exp_name):
    pod_labels = {"chaos-controller": "kubeinvaders", "experiment-name": exp_name, "chaos-codename": codename}
    pod_labels.update(additional_labels)
    pod_template = client.V1PodTemplateSpec(
        spec=client.V1PodSpec(restart_policy="Never", containers=[container]),
        metadata=client.V1ObjectMeta(name=pod_name, labels=pod_labels),
    )
    return pod_template

def create_job(job_name, pod_template):
    metadata = client.V1ObjectMeta(name=job_name, labels={"chaos-controller": "kubeinvaders", "chaos-codename": codename})
    job = client.V1Job(
        api_version="batch/v1",
        kind="Job",
        metadata=metadata,
        spec=client.V1JobSpec(backoff_limit=0, template=pod_template),
    )
    return job


# create logger
logging.basicConfig(level=os.environ.get("LOGLEVEL", "INFO"))
logging.info('[PROGRAMMING_MODE] Starting script...')

if os.path.exists(sys.argv[1]) == False:
    logging.info("[PROGRAMMING_MODE] Chaos program not found, please check the path...")
    exit(0)

with open(sys.argv[1], 'r') as stream:
    try:
        logging.info('[PROGRAMMING_MODE] Trying to parse chaos program...')
        parsed_yaml=yaml.safe_load(stream)
        #logging.info(f"Parsed yaml => {parsed_yaml}")
    except yaml.YAMLError as exc:
        ret = f"[PROGRAMMING_MODE] Invalid YAML syntax, please fix choas program code..."
        logging.info(ret)
        print(ret)
        quit()

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
k8s_regex = "[a-z0-9]([-a-z0-9]*[a-z0-9])?"
prom_regex = "[a-zA-Z_:][a-zA-Z0-9_:]*"
codename = parsed_yaml["chaos-codename"]

for job in parsed_yaml["k8s_jobs"]:
    logging.info(f"Found job {job}")
    if not re.fullmatch(k8s_regex, job):
        ret = f"[PROGRAMMING_MODE] Invalid name for k8s_jobs: {job}, please match Kubernetes name format '[a-z0-9]([-a-z0-9]*[a-z0-9])?'"
        logging.info(ret)
        print(ret)
        quit()
    
for exp in parsed_yaml["experiments"]:

    for _ in range(exp["loop"]):
        logging.info(f"[PROGRAMMING_MODE] Processing the experiment {exp}")
        job_attrs = parsed_yaml["k8s_jobs"][exp["k8s_job"]]
        args = []
        for arg in job_attrs['args']:
            args.append(str(arg))

        logging.info(f"[PROGRAMMING_MODE] args = {args}, command = {job_attrs['command']}, image = {job_attrs['image']}, k8s_job = {exp['k8s_job']}")

        if not re.fullmatch(prom_regex, exp["name"]):
            ret = f"[PROGRAMMING_MODE] Invalid name for experiment: {exp['name']}, please match Prometheus metric name format '[a-zA-Z_:][a-zA-Z0-9_:]*'"
            logging.info(ret)
            print(ret)
            quit()

        container = create_container(
            image = job_attrs['image'], 
            name = exp['k8s_job'],
            command = [job_attrs['command']],
            args = args
        )
        
        letters = string.ascii_lowercase
        rand_suffix = ''.join(random.choice(letters) for i in range(5))
        job_name = f"{exp['k8s_job']}-{rand_suffix}"

        if 'additional-labels' in job_attrs:
            logging.info(f"additional-labels = {job_attrs['additional-labels']}")
            pod_template = create_pod_template(f"{exp['k8s_job']}_exec", job_attrs['additional-labels'], container, exp['name'])
        else:
            pod_template = create_pod_template(f"{exp['k8s_job']}_exec", {}, container, exp['k8s_job'])
        
        logging.info(f"Creating job {job_name}")
        job_def = create_job(job_name, pod_template)

        try:
            batch_api.create_namespaced_job('kubeinvaders', job_def)
            logging.info(f"[PROGRAMMING_MODE] Job {job_name} created successfully")

        except ApiException as e:
            logging.info(f"[PROGRAMMING_MODE] Error creating job: {e}")
            quit()

        # if 'additional-labels' in job_attrs and 'chaos-codename' in job_attrs['additional-labels']:
        #     logging.info(f"[PROGRAMMING_MODE] Setting Redis keys for chaos-codename: {job_attrs['additional-labels']['chaos-codename']}")
        #     codename = job_attrs['additional-labels']['chaos-codename']
        metric_job_name = job_name.replace("-","_");
        r.set(f"chaos_jobs_status:{codename}:{exp['name']}:{metric_job_name}", 0.0)
        
        if r.exists('chaos_node_jobs_total') == 1:
            r.incr('chaos_node_jobs_total')
        else:
            r.set("chaos_node_jobs_total", 1)
os.remove(sys.argv[1])
