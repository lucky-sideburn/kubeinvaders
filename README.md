![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/logo.png)

*Gamified chaos engineering and analysis tool for Kubernetes. It is like Space Invaders but the aliens are PODs.*

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/kubeinvaders.png)

# Table of Contents

1. [Description](#Description)
2. [Special Input Keys and features](#Special-Input-Keys-and-features)
3. [Installation](#Installation)
4. [Prometheus Metrics - Make sense of Kubeinvaders!](#Metrics)
5. [Notes for large clusters](#Notes-for-large-clusters)
6. [Configuration](#Configuration)

## Description

KubeInvaders has been developed using [Defold](https://www.defold.com/).

Through KubeInvaders you can stress a Kubernetes cluster in a fun way and check how it is resilient.

I added also new experimental features like a linter for the pods. The current latest image of the game include [kube-linter](https://github.com/stackrox/kube-linter) developed by [stackrox](https://github.com/stackrox).

## Special Input Keys and features

| Input           | Action                                                                                     |
|-----------------|--------------------------------------------------------------------------------------------|
|     n           | Change namespace (you should define namespaces list. Ex: TARGET_NAMESPACE=foo1,foo2,foo3). |
|     a           | Switch to automatic mode.                                                                  |
|     m           | Switch to manual mode.                                                                     |
|     h           | Show special keys.                                                                         |
|     q           | Hide help for special keys.                                                                |
|     i           | Show pod's name. Move the ship towards an alien.                                           |
|     r           | Refresh log of a pod when spaceship is over the alien.                                     |
|     k           | *(NEW)* Perform [kube-linter](https://github.com/stackrox/kube-linter) analysis for a pod. |
|     w           | *(NEW)* Chaos engineering against Kubernetes nodes.                                        |

### Known problems

It seems that KubeInvaders does not work with EKS because of problems with ServiceAccount. Work in progress!

### Show logs of a pod

Move the spaceship over a white alien.

## Hands-on Tutorial

To experience KubeInvaders in action, try it out in this free O'Reilly Katacoda scenario, [KubeInvaders](https://www.katacoda.com/kuber-ru/courses/kubernetes-chaos).

## Installation

### Install to Kubernetes with Helm (v3+)

```bash
# Set target_namespace and ingress.hostname!
git clone https://github.com/lucky-sideburn/KubeInvaders.git

kubectl create namespace kubeinvaders

helm install kubeinvaders --set-string target_namespace="namespace1\,namespace2" \
--namespace kubeinvaders ./helm-charts/kubeinvaders \
--set ingress.hostName=kubeinvaders.io
```

### Install client on your workstation

The easiest way to install KubeInvaders is on your workstation but if you choose this method you cannot use kube-linter feature directly from the game. Follow this guide:

1. Start KubeInvaders docker container locally

```bash
docker rm kubeinvaders -f  && docker run --env DEVELOPMENT=true --env ENDPOINT=https://<k8s_url> --env NAMESPACE=namespace1,namespace2 --env TOKEN=<Service Account token> -p 8080:8080 --name kubeinvaders docker.io/luckysideburn/kubeinvaders
```

2. Create $HOME/.KubeInv.json like this - The endpoint is localhost:8080 because it is using KubeInvaders container as a proxy 
to Kubernetes:

```json
{
  "token": "<Service Account Token>",
  "endpoint": "http://localhost:8080",
  "namespace": "namespace1,namespace2"
}
```

Download the game from these locations:

* [MacOS](https://github.com/lucky-sideburn/KubeInvaders/releases/download/chaos_node-2.0/x86_64-darwin.zip)
* [Linux](https://github.com/lucky-sideburn/KubeInvaders/releases/download/chaos_node-2.0/x86_64-linux.zip)

### Run directly from Docker

This method can be used for developing KubeInvaders and testing the HTML5 bundle.
Using this method you can have problem of CORS:

```bash
docker build . -t kubeinvaders_dev

docker rm kubeinvaders -f  && docker run --env DEVELOPMENT=true --env ENDPOINT=https://youk8scluster:8443 --env NAMESPACE=kubeinvadersdemo --env TOKEN=xxxx -p 8080:8080 --name kubeinvaders kubeinvaders_dev
```

### Install KubeInvaders on OpenShift

To Install KubeInvaders on your OpenShift Cluster clone this repo and launch the following commands:

```bash
oc create clusterrole kubeinvaders-role --verb=watch,get,delete,list --resource=pods,pods/log,jobs

TARGET_NAMESPACE=foobar,awesome-namespace
## You can define multiple namespaces ex: TARGET_NAMESPACE=foobar,foobar2

# Choose route host for your kubeinvaders instance.
ROUTE_HOST=kubeinvaders.org

# Please add your source ip IP_WHITELIST. This will add haproxy.router.openshift.io/ip_whitelist in KubeInvaders route
# https://docs.openshift.com/container-platform/3.9/architecture/networking/routes.html#whitelist
IP_WHITELIST="93.44.96.4"

oc new-project kubeinvaders --display-name='KubeInvaders'
oc create sa kubeinvaders -n kubeinvaders
oc adm policy add-cluster-role-to-user kubeinvaders-role -z kubeinvaders -n kubeinvaders

KUBEINVADERS_SECRET=$(oc get secret -n kubeinvaders --field-selector=type==kubernetes.io/service-account-token | grep 'kubeinvaders-token' | awk '{ print $1}' | head -n 1)

oc process -f openshift/KubeInvaders.yaml -p ROUTE_HOST=$ROUTE_HOST -p TARGET_NAMESPACE=$TARGET_NAMESPACE -p KUBEINVADERS_SECRET=$KUBEINVADERS_SECRET | oc create -f -
```

#### How the configuration of KubeInvaders DeploymentConfig should be (remember to use your TARGET_NAMESPACE and ROUTE_HOST)

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/dcenv.png)

## Notes for large clusters

For clusters with many workers-nodes, KubeInvaders selects a subset of random items.

| Item      | Max Number   |
|-----------|--------------|
| Nodes     | 15           |
## Metrics

KubeInvaders exposes metrics for Prometheus through the standard endpoint /metrics

In order to use metrics functions install Redis into the namespace of Kubeinvaders

```bash
helm install redis bitnami/redis -n kubeinvaders -f redis/values.yaml
```

## Configuration
### Environment Variables - Make the game more difficult to win!

Set the following variables in Kubernetes Deployment or OpenShift DeploymentConfig:

| ENV Var                     | Description                                                                   |
|-----------------------------|-------------------------------------------------------------------------------|
| ALIENPROXIMITY (default 15) | Reduce the value to increase distance between aliens.                         |
| HITSLIMIT (default 0)       | Seconds of CPU time to wait before shooting.                                  |
| UPDATETIME (default 1)      | Seconds to wait before update PODs status (you can set also 0.x Es: 0.5).     |
