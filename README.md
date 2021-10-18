*Gamified chaos engineering tool for Kubernetes. It is like Space Invaders but the aliens are pods or worker nodes.*

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/webui.png)

[Video HowTo of version v1.9](https://www.youtube.com/watch?v=wD7ngPlNEjY)

# Table of Contents

1. [Description](#Description)
2. [Installation](#Installation)
3. [Usage](#Usage)
4. [Known Problems](#Known-problems)
5. [Metrics](#Metrics)
6. [Security](#Security)
7. [Community](#Community)
8. [Community blogs and videos](#Community-blogs-and-videos)
9. [License](#License)
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

At the top you will find some metrics as described below:

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/metrics_bar.png)

**Current Replicas State Delay** is a metric that show how much time the cluster takes to coming back at the desired state of pods replicas.

This is a control-plane you can use to switch off & on various features.

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/control-plane.png)

### YouTube HowTo

[Video How To of version v1.9](https://www.youtube.com/watch?v=wD7ngPlNEjY)
### Start The Chaos Experiment

Press the button "Start" to start automatic pilot (button changes to "Stop" to disable this feature).
### Enable Shuffle

Press the button "Enable Shuffle" to switch randomly the positions of pods or k8s nodes (button changes to "Disable Shuffle" to disable this feature).
### Enable Auto Jump Between Namespace

Press the button "Auto NS Switch" to switch randomly between namespaces (button changes to "Disable Auto NS Switch" to disable this feature).
### Show / Hide pods name

Press the button "Hide Pods Name" to hide the name of the pods under the aliens (button changes to "Show Pods Name" to disable this feature).
### Information about current status and events

As described below, on the game screen, near the spaceship, there are details about current cluster, namespace and some configurations.

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/game-info.png)

Under + and - buttons appears a bar with the latest occurred game events.

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/game-events.png)

### Do Kube-linter Lint

It is possibile using [kube-linter](https://github.com/stackrox/kube-linter) through KubeInvaders in order to scan resources looking for best-practices or improvements to apply.

[Example from YouTube](https://www.youtube.com/watch?v=n_EuYjq3M-A)

### Show Special Keys

Press 'h' or select 'Show Special Keys' from the menu.

### Zoom In / Out

Press + or - buttons to increase or decrease the game screen.

### Chaos Containers for masters and workers nodes

- Select from the menu "Show Current Chaos Container for nodes" for watching which container start when you fire against a worker node (not an alien, they are pods).

- Select from the menu "Set Custom Chaos Container for nodes" for using your preferred image or configuration against nodes.

## Known problems

* It seems that KubeInvaders does not work with EKS because of problems with ServiceAccount. Work in progress!

## Hands-on Tutorial

To experience KubeInvaders in action, try it out in this free O'Reilly Katacoda scenario, [KubeInvaders](https://www.katacoda.com/kuber-ru/courses/kubernetes-chaos).

## Prometheus Metrics

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
## Community

Please reach out for news, bugs, feature requests, and other issues via:

- On Twitter: [@kubeinvaders](https://twitter.com/kubeinvaders) & [@luckysideburn](https://twitter.com/luckysideburn)
- New features are published on YouTube too in [this channel](https://www.youtube.com/channel/UCQ5BQ8R2fDL_WkNAllYRrpQ)

## Community blogs and videos

- Kubernetes.io blog: [KubeInvaders - Gamified Chaos Engineering Tool for Kubernetes](https://kubernetes.io/blog/2020/01/22/kubeinvaders-gamified-chaos-engineering-tool-for-kubernetes/)
- acloudguru: [cncf-state-of-the-union](https://acloudguru.com/videos/kubernetes-this-month/cncf-state-of-the-union)
- DevNation RedHat Developer: [Twitter](https://twitter.com/sebi2706/status/1316681264179613707)
- Flant: [Open Source solutions for chaos engineering in Kubernetes](https://blog.flant.com/chaos-engineering-in-kubernetes-open-source-tools/)
- Reeinvent: [KubeInvaders - gamified chaos engineering](https://www.reeinvent.com/blog/kubeinvaders)
- Adrian Goins: [K8s Chaos Engineering with KubeInvaders](https://www.youtube.com/watch?v=bxT-eJCkqP8)
- dbafromthecold: [Chaos engineering for SQL Server running on AKS using KubeInvaders](https://dbafromthecold.com/2019/07/03/chaos-engineering-for-sql-server-running-on-aks-using-kubeinvaders/)
- Pklinker: [Gamification of Kubernetes Chaos Testing](https://pklinker.medium.com/gamification-of-kubernetes-chaos-testing-bd2f7a7b6037)
- Openshift Commons Briefings: [OpenShift Commons Briefing KubeInvaders: Chaos Engineering Tool for Kubernetes](https://www.youtube.com/watch?v=3OOXOCTAYF0&t=4s)
- GitHub: [awesome-kubernetes repo](https://github.com/ramitsurana/awesome-kubernetes)
- William Lam: [Interesting Kubernetes application demos](https://williamlam.com/2020/06/interesting-kubernetes-application-demos.html)
- The Chief I/O: [5 Fun Ways to Use Kubernetes ](https://thechief.io/c/editorial/5-fun-ways-use-kubernetes/?utm_source=twitter&utm_medium=social&utm_campaign=thechiefio&utm_content=articlesfromthechiefio)
- LuCkySideburn: [Talk @ Codemotion](https://www.slideshare.net/EugenioMarzo/kubeinvaders-chaos-engineering-tool-for-kubernetes-and-openshift)
- Chaos Carnival: [Chaos Engineering is fun!](https://www.youtube.com/watch?v=10tHPl67A9I&t=3s)
- Kubeinvaders (old version) + OpenShift 4 Demo: [YouTube_Video](https://www.youtube.com/watch?v=kXm2uU5vlp4)
- KubeInvaders (old version) Vs Openshift 4.1: [YouTube_Video](https://www.youtube.com/watch?v=7R9ftgB-JYU)
- Chaos Engineering for SQL Server | Andrew Pruski | Conf42: Chaos Engineering: [YouTube_Video](https://www.youtube.com/watch?v=HCy3sjMRvlI)


## License

KubeInvaders is licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) for the full license text.
