from asyncio.log import logger
import yaml
import logging
import os
from kubernetes import client, config
from kubernetes.client.rest import ApiException
import requests
from string import Template


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
        metadata=client.V1ObjectMeta(name=pod_name, labels={"pod_name": pod_name}),
    )

    return pod_template

def create_job(job_name, pod_template):
    metadata = client.V1ObjectMeta(name=job_name, labels={"job_name": job_name})

    job = client.V1Job(
        api_version="batch/v1",
        kind="Job",
        metadata=metadata,
        spec=client.V1JobSpec(backoff_limit=0, template=pod_template),
    )
    logger.info(job)
    return job


# create logger
logging.basicConfig(level=os.environ.get("LOGLEVEL", "INFO"))
logging.info('Starting script for KubeInvaders programming mode')

with open("./example.yaml", 'r') as stream:
    try:
        parsed_yaml=yaml.safe_load(stream)
        logging.info(f"Parsed yaml => {parsed_yaml}")
    except yaml.YAMLError as exc:
        print(exc)

configuration = client.Configuration()
configuration.api_key = {"authorization": "Bearer ...."}
configuration.host = 'https://localhost:6443'
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
    logging.info(f"args= {job_attrs['args']}")
    container = create_container(
        image = job_attrs["image"], 
        name = exp["name"], 
        command = job_attrs["command"],
        args = job_attrs["args"]
    )
    
    pod_template = create_pod_template(exp["name"], container)
    logging.info(f"Creating job {exp['name']}")
    job_def = create_job(exp["name"], pod_template)
    batch_api.create_namespaced_job('kubeinvaders', job_def)

# try:
#     api_response = api_instance.list_namespaced_pod_template(namespace, pretty=True, label_selector='foo=bar')
#     logging.info(api_response)
# except ApiException as e:
#     logging.info(e)

# if len(api_response.items) == 0:
#     logging.info("Black box exporter is not installed. Installing it...")

