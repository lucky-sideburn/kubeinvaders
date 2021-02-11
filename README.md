![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/logo.png)

*Gamified chaos engineering and analysis tool for Kubernetes. It is like Space Invaders but the aliens are pods or worker nodes.*

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/kubeinvaders.png)

# Table of Contents

1. [Description](#Description)
2. [New Version (game part in pure JS)](#new-version)
3. [Special Input Keys and features](#Special-Input-Keys-and-features)
4. [Prometheus metrics and Grafana](#Metrics)
5. [Installation](#Installation)
6. [Notes for large clusters](#Notes-for-large-clusters)
7. [Configuration](#Configuration)


## Description

Through KubeInvaders you can stress a Kubernetes cluster in a fun way and check how it is resilient.


## New Version

KubeInvaders is going to be full open-source. Meanwhile it is possibile choose between 2 different versions.

Legacy version: Made suing Defold as game engine.
New version: It has been written in pure Javascript and it is totally open-source.

The new version of KubeInvaders has fewer features than legacy but is optimized for chaos engineering because pods and nodes are rendered together and there is a shuffle for better random experiments.

## Special Input Keys and features

| Input           | Action                                                                                     | Version (New or Legacy)|
|-----------------|--------------------------------------------------------------------------------------------|------------------------|
|     n           | Change namespace (you should define namespaces list. Ex: TARGET_NAMESPACE=foo1,foo2,foo3). | New, Legacy            |
|     a           | Switch to automatic mode.                                                                  | Legacy                 |
|     m           | Switch to manual mode.                                                                     | Legacy                 |
|     h           | Show special keys.                                                                         | New, Legacy            |
|     q           | Hide help for special keys.                                                                | New, Legacy            |
|     i           | Show pod's name. Move the ship towards an alien.                                           | Legacy                 |
|     r           | Refresh log of a pod when spaceship is over the alien.                                     | Legacy                 |
|     k           | *(NEW)* Perform [kube-linter](https://github.com/stackrox/kube-linter) analysis for a pod. | Legacy                 |
|     w           | *(NEW)* Chaos engineering against Kubernetes nodes.                                        | New, Legacy            |

### Known problems

* It seems that KubeInvaders does not work with EKS because of problems with ServiceAccount. Work in progress!

## Hands-on Tutorial

To experience KubeInvaders in action, try it out in this free O'Reilly Katacoda scenario, [KubeInvaders](https://www.katacoda.com/kuber-ru/courses/kubernetes-chaos).


## Metrics

KubeInvaders exposes metrics for Prometheus through the standard endpoint /metrics

This is an example of Prometheus configuration

```bash
scrape_configs:
- job_name: kubeinvaders
  static_configs:
  - targets:
    - kubeinvaders.kubeinvaders.svc.cluster.local:8080
```
Example of metrics

| Metric           | Description                                                                                                                          |  
|------------------|--------------------------------------------------------------------------------------------------------------------------------------|
|     chaos_jobs_node_count{node=workernode01}               | Total number of chaos jobs executed per node                                               |
|     chaos_node_jobs_total                                  | Total number of chaos jobs executed against all worker nodes                               |                                                      
|     deleted_pods_total 16                                  | Total number of deleted pods                                                               |
|     deleted_namespace_pods_count{namespace=myawesomenamespace}           |Total number of deleted pods per namespace                                    |                                     

![Download Grafana dashboard](https://github.com/lucky-sideburn/KubeInvaders/blob/master/grafana/KubeInvadersDashboard.json)

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/grafana1.png)

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/grafana2.png)

## Installation
### Install to Kubernetes with Helm (v3+)

```bash
# Set target_namespace and ingress.hostname!
git clone https://github.com/lucky-sideburn/KubeInvaders.git

kubectl create namespace kubeinvaders

# Install new and full open-source version
helm install kubeinvaders --set-string target_namespace="namespace1\,namespace2" \
--namespace kubeinvaders ./helm-charts/kubeinvaders \
--set ingress.hostName=kubeinvaders.io --set image.tag=purejs

# Install legacy version
helm install kubeinvaders --set-string target_namespace="namespace1\,namespace2" \
--namespace kubeinvaders ./helm-charts/kubeinvaders \
--set ingress.hostName=kubeinvaders.io --set image.tag=legacy
```
### Security Notes

In order to restrict the access to the Kubeinvaders endpoint add this annotation into the ingress.

```yaml
nginx.ingress.kubernetes.io/whitelist-source-range: <your_ip>/32
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

## Notes for large clusters

For clusters with many workers-nodes, KubeInvaders (legacy version) selects a subset of random items.

| Item      | Max Number   |
|-----------|--------------|
| Nodes     | 15           |


## Configuration

### (Legacy Version) Environment Variables - Make the game more difficult to win!

Set the following variables in Kubernetes Deployment or OpenShift DeploymentConfig:

| ENV Var                     | Description                                                                   |
|-----------------------------|-------------------------------------------------------------------------------|
| ALIENPROXIMITY (default 15) | Reduce the value to increase distance between aliens.                         |
| HITSLIMIT (default 0)       | Seconds of CPU time to wait before shooting.                                  |
| UPDATETIME (default 1)      | Seconds to wait before update PODs status (you can set also 0.x Es: 0.5).     |
