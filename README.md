*Gamified chaos engineering tool for Kubernetes. It is like Space Invaders but the aliens are pods or worker nodes.*

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/metrics.png)

# Table of Contents

1. [Description](#Description)
2. [Installation](#Installation)
3. [Usage](#Usage)
4. [Known Problems](#Known-problems)
5. [Metrics](#Metrics)
6. [Security](#Security)

## Description

Through KubeInvaders you can stress a Kubernetes cluster in a fun way and check how it is resilient.

## Installation

### Install to Kubernetes with Helm (v3+)
[![Artifact HUB](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/kubeinvaders)](https://artifacthub.io/packages/search?repo=kubeinvaders)

```bash
helm repo add kubeinvaders https://lucky-sideburn.github.io/helm-charts/

kubectl create namespace kubeinvaders

helm install kubeinvaders --set-string target_namespace="namespace1\,namespace2" \
-n kubeinvaders kubeinvaders/kubeinvaders --set ingress.hostName=kubeinvaders.io --set image.tag=v1.9
```

## Usage

### Show Special Keys
Press 'h' or select 'Show Special Keys' from the menu

### Do Kube-linter Lint
It is possibile using kube-linter through KubeInvaders in order to scan resources looking for best-practices or improvements to apply.

[Example from YouTube](https://www.youtube.com/watch?v=n_EuYjq3M-A)

### Commands and metrics
At the top you will find some metrics, the start button for automatic pilot and the rand-factor bar for increasing or decreasing speed of automatic shots.

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/commands.png)

Current Replicas State Delay is a metric that show how much time the cluster takes to coming back at the desired state of pods replicas.

### Chaos Containers for masters and workers nodes
Select from the menu "Show Current Chaos Container for nodes" for watching which container start when you fire against a worker node (not an alien, they are pods).
Select from the menu "Set Custom Chaos Container for nodes" for use your preferred image or configuration for stressing Kubernetes nodes.

## Known problems

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


## Security

In order to restrict the access to the Kubeinvaders endpoint add this annotation into the ingress.

```yaml
nginx.ingress.kubernetes.io/whitelist-source-range: <your_ip>/32
```
