# kubeinvaders :space_invader: aka k-inv :joystick:

**Gamified Chaos Engineering and Educational Tool for Kubernetes**

This project, recommended by the CNCF (https://github.com/cncf/sandbox/issues/124), has a strong following and significant educational value. It's a chaos engineering tool, but it's also recommended for studying Kubernetes and resilience topics.

It is part of the Cloud Native Computing Foundation's (CNCF) landscape in the Observability and Analysis - Chaos Engineering section (https://landscape.cncf.io/).

Launch the demo at this link: https://kubeinvaders.platformengineering.it/

The teams at Platform Engineering (https://platformengineering.it/) and DevOps Tribe (https://devopstribe.it/) back this project. They provide enterprise-grade features and SRE experts to help customers verify the resilience of their Kubernetes infrastructure.

Here are the slides (https://www.slideshare.net/EugenioMarzo/kubeinvaders-chaos-engineering-practices-for-kubernetes1pdf) from the Chaos Engineering speech I prepared for FOSDEM 2023. Unfortunately, I couldn't be present at my talk, but I still wanted to share them with the community."

# Table of Contents

1. [Description](#Description)
2. [Installation - Helm with ClusterIP Service + Nginx Ingress](#Installation-default)
2. [Installation - Helm with NodePort Service](#Installation-nodeport)
2. [Installation - Using Podman or Docker](#Installation-podman)
3. [Usage](#Usage)
4. [URL Monitoring During Chaos Session](#URL-Monitoring-During-Chaos-Session)
5. [Persistence](#Persistence)
6. [Generic Troubleshooting & Known Problems](#Generic-Troubleshooting-And-Known-Problems)
7. [Troubleshooting Unknown Namespace](#Troubleshooting-Unknown-Namespace)
8. [Metrics](#Metrics)
9. [Security](#Security)
10. [Roadmap](#Roadmap)
11. [Community](#Community)
12. [Community blogs and videos](#Community-blogs-and-videos)
13. [License](#License)

## Description

Inspired by the classic Space Invaders game, Kubeinvaders offers a playful and engaging way to learn about Kubernetes resilience by stressing a cluster and observing its behavior under pressure. This open-source project, built without relying on any external frameworks, provides a fun and educational experience for developers to explore the limits and strengths of their Kubernetes deployments

## Installation-default

If you need a lab kubernetes cluster you can use this setup via Make and Minikube. Follow [this readme](./minikube-setup/README.md)

[![Artifact HUB](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/kubeinvaders)](https://artifacthub.io/packages/search?repo=kubeinvaders)

```bash
# Please be sure to use kubeinvaders-1.9.8 that is ne latest helm chart version!

helm repo add kubeinvaders https://lucky-sideburn.github.io/helm-charts/
helm repo update

kubectl create namespace kubeinvaders

# With ingress and TLS enabled
helm install --set-string config.target_namespace="namespace1\,namespace2" --set ingress.enabled=true --set ingress.hostName=kubeinvaders.local --set deployment.image.tag=latest -n kubeinvaders kubeinvaders kubeinvaders/kubeinvaders --set ingress.tls_enabled=true

# With ingress enabled but TLS disabled (in case you have a reverse-proxy that does TLS termination and nginx controller in http)
helm install --set-string config.target_namespace="namespace1\,namespace2" --set ingress.enabled=true --set ingress.hostName=kubeinvaders.local --set deployment.image.tag=latest -n kubeinvaders kubeinvaders kubeinvaders/kubeinvaders/ --set ingress.tls_enabled=false

```

### Example for K3S

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik" sh -s -

cat >/tmp/ingress-nginx.yaml <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: ingress-nginx
---
apiVersion: helm.cattle.io/v1
kind: HelmChart
metadata:
  name: ingress-nginx
  namespace: kube-system
spec:
  chart: ingress-nginx
  repo: https://kubernetes.github.io/ingress-nginx
  targetNamespace: ingress-nginx
  version: v4.9.0
  set:
  valuesContent: |-
    fullnameOverride: ingress-nginx
    controller:
      kind: DaemonSet
      hostNetwork: true
      hostPort:
        enabled: true
      service:
        enabled: false
      publishService:
        enabled: false
      metrics:
        enabled: false
        serviceMonitor:
          enabled: false
      config:
        use-forwarded-headers: "true"
EOF

kubectl create -f /tmp/ingress-nginx.yaml

kubectl create ns namespace1
kubectl create ns namespace2

export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

helm install kubeinvaders --set-string config.target_namespace="namespace1\,namespace2" \
-n kubeinvaders kubeinvaders/kubeinvaders --set ingress.enabled=true --set ingress.hostName=kubeinvaders.io --set deployment.image.tag=latest
```

### Install to Kubernetes with Helm (v3+) - LoadBalancer / HTTP (tested with GKE)

```bash
helm install kubeinvaders --set-string config.target_namespace="namespace1\,namespace2" -n kubeinvaders kubeinvaders/kubeinvaders --set ingress.enabled=true --set ingress.hostName=kubeinvaders.local --set deployment.image.tag=latest --set service.type=LoadBalancer --set service.port=80

kubectl set env deployment/kubeinvaders DISABLE_TLS=true -n kubeinvaders
```

### SCC for Openshift

```bash
oc adm policy add-scc-to-user anyuid -z kubeinvaders
```

### Route for Openshift

```bash
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: kubeinvaders
  namespace: "kubeinvaders"
spec:
  host: "kubeinvaders.io"
  to:
    name: kubeinvaders
  tls:
    termination: Edge
```
## Add simple nginx Deployment for Pods to shot at
```bash
cat >deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 20 # tells deployment to run 20 pods matching the template
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.24.0
        ports:
        - containerPort: 81
EOF
```

Apply Nginx Deployment in namespace1 and namespace2
```bash
sudo kubectl apply -f deployment.yaml -n namespace1
sudo kubectl apply -f deployment.yaml -n namespace2
```

## Installation-nodeport

Let's say we have a Layer 4 or Layer 7 Load Balancer that redirects traffic directly to the KubeInvaders Service Node Port.

For example, consider this HaProxy configuration. We don't want to use TLS in this scenario (just for experimentation).

Remember to disable TLS: **kubectl set env deployment/kubeinvaders DISABLE_TLS=true -n kubeinvaders**
(TODO: put this into values of the Helm)

**HaProxy Configuration**
```bash
global
    log         127.0.0.1 local2

    chroot      /var/lib/haproxy
    pidfile     /var/run/haproxy.pid
    maxconn     4000
    user        haproxy
    group       haproxy
    daemon

    # turn on stats unix socket
    stats socket /var/lib/haproxy/stats

    # utilize system-wide crypto-policies
    ssl-default-bind-ciphers PROFILE=SYSTEM
    ssl-default-server-ciphers PROFILE=SYSTEM

defaults
    mode                    tcp
    log                     global
    option                  httplog
    option                  dontlognull
    option http-server-close
    option forwardfor       except 127.0.0.0/8
    option                  redispatch
    retries                 3
    timeout http-request    10s
    timeout queue           1m
    timeout connect         10s
    timeout client          1m
    timeout server          1m
    timeout http-keep-alive 10s
    timeout check           10s
    maxconn                 3000

frontend mylb
    bind *:80
    default_backend mynodeport

backend mynodeport
    balance roundrobin
```

**Installation steps using NodePort**

```bash

helm repo add kubeinvaders https://lucky-sideburn.github.io/helm-charts/ && helm repo list
VERSION=latest

helm install kubeinvaders kubeinvaders/kubeinvaders \
  --version=$VERSION \
  --namespace kubeinvaders \
  --create-namespace \
  --set service.type=NodePort \
  --set service.nodePort=30016 \
  --set ingress.enabled=false \
  --set config.target_namespace="default\,namespace1" \
  --set route_host=foobar.local

kubectl set env deployment/kubeinvaders DISABLE_TLS=true -n kubeinvaders
```
## Installation-podman

### Run through Docker or Podman

Create the required components (assumes k8s v1.24+):

```bash
cat << 'EOF' | kubectl apply -f -
apiVersion: v1
kind: Namespace
metadata:
  name: kubeinvaders
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: kinv-cr
rules:
  - apiGroups:
      - ""
    resources:
      - pods
      - pods/log
    verbs:
      - delete
  - apiGroups:
      - batch
      - extensions
    resources:
      - jobs
    verbs:
      - get
      - list
      - watch
      - create
      - update
      - patch
      - delete
  - apiGroups:
      - "*"
    resources:
      - "*"
    verbs:
      - get
      - watch
      - list
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: kinv-sa
  namespace: kubeinvaders
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: kinv-crb
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: kinv-cr
subjects:
  - kind: ServiceAccount
    name: kinv-sa
    namespace: kubeinvaders
---
apiVersion: v1
kind: Secret
type: kubernetes.io/service-account-token
metadata:
  name: kinv-sa-token
  namespace: kubeinvaders
  annotations:
    kubernetes.io/service-account.name: kinv-sa
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  namespace: default
  name: kubevirt-vm-restart-role
rules:
- apiGroups: ["subresources.kubevirt.io"]
  resources: ["virtualmachines/restart"]
  verbs: ["update"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: kubevirt-vm-restart-binding
  namespace: default
subjects:
- kind: ServiceAccount
  name: kubeinvaders
  namespace: kubeinvaders
roleRef:
  kind: ClusterRole
  name: kubevirt-vm-restart-role
  apiGroup: rbac.authorization.k8s.io
EOF
```

Extract the token:

```bash
TOKEN=$(k get secret -n kubeinvaders -o go-template='{{.data.token | base64decode}}' kinv-sa-token)
```
Create two namespaces:

```bash
kubectl create namespace namespace1
kubectl create namespace namespace2
```
Run the container:

```bash
podman run -p 8080:8080 \
--env K8S_TOKEN=**** \
--env APPLICATION_URL=http://localhost:8080 \
--env DISABLE_TLS=true \
--env KUBERNETES_SERVICE_HOST=10.10.10.4 \
--env KUBERNETES_SERVICE_PORT_HTTPS=6443 \
--env NAMESPACE=namespace1,namespace2 \
luckysideburn/kubeinvaders:latest
```

Given this example, you can access k-inv at the following address: [http://localhost:3131](http://localhost:3131)

- Please pay attention to the command "podman run -p 3131:8080". Forwarding port 8080 is important.
- We suggest using `DISABLE_TLS=true` for local development environments.
- Follow the instructions above to create the token for `K8S_TOKEN`.
- In the example, we use image tag `latest`, use `latest_debug` for debugging.

#### Params

##### K8S_TOKEN

These are the permissions your service account must have. You can take an example from [this clusterrole](https://github.com/lucky-sideburn/kubeinvaders/blob/master/helm-charts/kubeinvaders/templates/rbac-cluster.yaml).

- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["delete"]
- apiGroups: ["batch", "extensions"]
  resources: ["jobs"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["get", "watch", "list"]

##### APPLICATION_URL

URL of the web console

##### DISABLE_TLS

Disable HTTPS for the web console

##### KUBERNETES_SERVICE_HOST

IP address or DNS name of your control plane.

##### KUBERNETES_SERVICE_PORT_HTTPS

TCP port of the target control plane.

#### NAMESPACE

List the namespaces you want to stress or on which you want to see logs (logs are a beta feature, they might not work or could slow down the browser...).

```bash
podman run -p 8080:8080 \
--env K8S_TOKEN=*** \
--env APPLICATION_URL=http://localhost:8080 \
--env DISABLE_TLS=true \
--env KUBERNETES_SERVICE_HOST=10.10.10.4 \
--env KUBERNETES_SERVICE_PORT_HTTPS=6443 \
--env NAMESPACE=namespace1,namespace2 \
luckysideburn/kubeinvaders:latest
```

## Usage

At the top you will find some metrics as described below:

![Alt Text](./doc_images/metrics_bar.png)

**Current Replicas State Delay** is a metric that show how much time the cluster takes to come back at the desired state of pods replicas.

This is a control-plane you can use to switch off & on various features.

![Alt Text](./doc_images/control-plane.png)

### Start The Chaos Experiment

Press the "Start" button to initiate the automatic pilot (the button changes to "Stop" to disable this feature).

### Enable Shuffle :joystick:

Press the "Enable Shuffle" button to randomly rearrange the positions of pods or K8s nodes (the button changes to "Disable Shuffle" to deactivate this feature).

### Enable Auto Jump Between Namespace :joystick:

Press the "Auto NS Switch" button to randomly switch between namespaces (the button changes to "Disable Auto NS Switch" to deactivate this feature).

### Show / Hide Pods Name :joystick:

Press the "Hide Pods Name" button to conceal the names of the pods beneath the aliens (the button changes to "Show Pods Name" to deactivate this feature).

### Information about Current Status and Events :joystick:

As described below, on the game screen near the spaceship, there are details about the current cluster, namespace, and some configurations.

![Alt Text](./doc_images/game-info.png)

Under the + and - buttons, a bar appears with the latest game events.

![Alt Text](./doc_images/game-events.png)

### Show Special Keys :joystick:

Press 'h' or select 'Show Special Keys' from the menu.

### Zoom In / Out :joystick:

Press the + or - buttons to increase or decrease the game screen.

### Chaos Containers for Master and Worker Nodes

- Select "Show Current Chaos Container for Nodes" from the menu to see which container starts when you attack a worker node (not an alien, they are pods).

- Select "Set Custom Chaos Container for Nodes" from the menu to use your preferred image or configuration against nodes.

# URL Monitoring During Chaos Session

During a chaos engineering session, you can monitor the behavior of an HTTP call exposed by an Ingress.

Use the flag "Add HTTP check & Chaos Report" and add the URL to monitor
![Alt Text](./doc_images/url_monitor.png)

Follow real time charts during the experiment

![Alt Text](./doc_images/http_stats.png)


## Persistence

K-inv uses Redis to save and manage data. Redis is configured with "appendonly."

Currently, the Helm chart does not support PersistentVolumes, but this task is on the to-do list...

## Generic Troubleshooting and Known Problems

- It seems that KubeInvaders does not work with EKS due to problems with ServiceAccount.
- Currently, the installation of KubeInvaders into a namespace that is not named "kubeinvaders" is not supported.
- I have only tested KubeInvaders with a Kubernetes cluster installed through KubeSpray.
- If you don't see aliens, please follow these steps:
  1.  Open a terminal and run "kubectl logs <pod_of_kubeinvader> -n kubeinvaders -f"
  2.  Execute the following command from another terminal: `curl "https://<your_kubeinvaders_url>/kube/pods?action=list&namespace=namespace1" -k`
  3.  Open an issue with attached logs.
- If you use route_host insted of ingress, please specify also the port like route_host: "kubeinvaders.example.com:8080". The port must be the same of the NodePort service

## Troubleshooting Unknown Namespace

- Check if the namespaces declared with helm config.target_namespace (e.g., config.target_namespace="namespace1\,namespace2") exist and contain some pods.
- Check your browser's developer console for any failed HTTP requests (send them to luckysideburn[at]gmail[dot]com or open an issue on this repo).
- Try using latest_debug and send logs to luckysideburn[at]gmail[dot]com or open an issue on this repo.

## Prometheus Metrics

KubeInvaders exposes metrics for Prometheus through the standard endpoint /metrics.

Here is an example of Prometheus configuration:

```bash
scrape_configs:
- job_name: kubeinvaders
  static_configs:
  - targets:
    - kubeinvaders.kubeinvaders.svc.cluster.local:8080
```

Example of metrics:

| Metric                                                     | Description                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| chaos_jobs_node_count{node=workernode01}                   | Total number of chaos jobs executed per node                 |
| chaos_node_jobs_total                                      | Total number of chaos jobs executed against all worker nodes |
| deleted_pods_total 16                                      | Total number of deleted pods                                 |
| deleted_namespace_pods_count{namespace=myawesomenamespace} | Total number of deleted pods per namespace                   |

![Download Grafana dashboard](./confs/grafana/KubeInvadersDashboard.json)

![Alt Text](./doc_images/grafana1.png)

![Alt Text](./doc_images/grafana2.png)

## Security

In order to restrict the access to the Kubeinvaders endpoint add this annotation into the ingress.

```yaml
nginx.ingress.kubernetes.io/whitelist-source-range: <your_ip>/32
```

## Roadmap

Roadmap: Chaos Engineering Platform Enhancement
Phase 1: Authentication and Authorization

    Implement robust user authentication:
        Allow for both local and external authentication (e.g., LDAP, OAuth)
        Securely store user credentials
    Introduce role-based access control (RBAC):
        Define granular permissions based on user roles (e.g., admin, engineer, viewer)
        Enforce authorization at the resource level (namespaces, experiments, etc.)

Phase 2: Analytics and Reporting

    Develop namespace-specific statistics:
        Track the frequency of chaos engineering sessions per namespace
        Visualize trends and patterns over time
    Create comprehensive reports:
        Generate customizable reports for management
        Include metrics on experiment coverage, success rates, and failure rates
    Export reporting data:
        Allow for data export in various formats (e.g., CSV, JSON, PDF)

Phase 3: API Development

    Expose platform functionality via a RESTful API:
        Enable integration with other tools and systems
        Support CRUD operations for core entities (experiments, scenarios, etc.)

Phase 4: UI Enhancements

    Improve user experience:
        Redesign the UI for better usability and aesthetics
        Optimize performance and responsiveness

Phase 5: LLM Integration for Experiment Creation

    Integrate an LLM: Develop an interface that allows users to describe experiments in natural language.
    Translate to code: Utilize the LLM to translate natural language descriptions into executable code.
    Validate and optimize: Implement mechanisms to validate and optimize the code generated by the LLM.

## Community

Please reach out for news, bugs, feature requests, and other issues via:

- On Twitter: [@kubeinvaders](https://twitter.com/kubeinvaders) & [@luckysideburn](https://twitter.com/luckysideburn)
- New features are published on YouTube too in [this channel](https://www.youtube.com/channel/UCQ5BQ8R2fDL_WkNAllYRrpQ)

## Community blogs and videos

- [The Kubernetes ecosystem is a candy store](https://opensource.googleblog.com/2024/06/the-kubernetes-ecosystem-is-candy-store.html)
- [ AdaCon Norway Live Stream ](https://www.youtube.com/watch?v=rt_eM_KRfK4)
- [ LILiS - Linux Day 2023 Benevento ](https://www.youtube.com/watch?v=1tHkEfbGjgE)
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
- nicholaschangblog: [Introducing Azure Chaos Studio](https://nicholaschangblog.com/azure/introduction-to-azure-choas-studio/)
- bugbug: [Chaos Testing: Everything You Need To Know](https://bugbug.io/blog/software-testing/chaos-testing-guide/)

## License

KubeInvaders is licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) for the full license text.
