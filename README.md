![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/logo.png)

*Gamified chaos engineering tool for Kubernetes. It is like Space Invaders but the aliens are PODs*

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/kubeinvaders.png)

### Description

KubeInvaders has been developed using Defold (https://www.defold.com/).

Through KubeInvaders you can stress Kubernetes cluster in a fun way and check how it is resilient.

### Special Input Keys

| Input           | Action                                                                                    |
|-----------------|-------------------------------------------------------------------------------------------|
|     n           | Change namespace (you should define namespaces list. Ex: TARGET_NAMESPACE=foo1,foo2,foo3).|
|     a           | Switch to automatic mode.                                                                 |
|     m           | Switch to manual mode.                                                                    |
|     h           | Show special keys.                                                                        |
|     q           | Hide help for special keys.                                                               |
|     i           | Show pod's name. Move the ship towards an alien.                                          |
|     r           | Refresh log of a pod when spaceship is over the alien.                                    |

### Show logs of a pod

Move the spaceship over a white alien

### Install with HELM

```
# Set target_namespace and ingress.hostname!
git clone https://github.com/lucky-sideburn/KubeInvaders.git

kubectl create namespace kubeinvaders

helm install kubeinvaders --set-string target_namespace="namespace1\,namespace2" \
--namespace kubeinvaders ./helm-charts/kubeinvaders \
--set ingress.hostName=kubeinvaders.io

```

### Run Directly from Docker

```bash
docker run --env DEVELOPMENT=true --env ROUTE_HOST=myocpcluster:8443 --env NAMESPACE=kubeinvaders --env ALIENPROXIMITY=15 --env HITSLIMIT=0  --env UPDATETIME=0.5 --env TOKEN=<my service account or user token>  --env KUBERNETES_SERVICE_PORT_HTTPS=8443 --env KUBERNETES_SERVICE_HOST=myocpcluster -p 8080:8080 --name kubeinvaders docker.io/luckysideburn/kubeinvaders:foo
```
go to http://localhost.8080

### Develop HTML5 application whit Defold and Docker

1. (Defold) Go to Project => Bundle => HTML5 Application
2. Copy the js-web folder inside the root of KubeInvaders project
3. docker build . -t docker.io/luckysideburn/kubeinvaders:foo
4. Run with this

```bash
docker run --env DEVELOPMENT=true --env ROUTE_HOST=myocpcluster:8443 --env NAMESPACE=kubeinvaders --env ALIENPROXIMITY=15 --env HITSLIMIT=0  --env UPDATETIME=0.5 --env TOKEN=<my service account or user token>  --env KUBERNETES_SERVICE_PORT_HTTPS=8443 --env KUBERNETES_SERVICE_HOST=myocpcluster -p 8080:8080 --name kubeinvaders docker.io/luckysideburn/kubeinvaders:foo
```
5. go to http://localhost.8080


### Environment Variables - Make the game more difficult to win!

Set the following variables in Kubernetes Deployment or Openshift DeploymentConfig

| ENV Var                     | Description                                                                   |
|-----------------------------|-------------------------------------------------------------------------------|
| ALIENPROXIMITY (default 15) | Reduce the value to increase distance between aliens                          |
| HITSLIMIT (default 0)       | Seconds of CPU time to wait before shooting                                   |
| UPDATETIME (default 1)      | Seconds to wait before update PODs status (you can set also 0.x Es: 0.5)      |

### Install client on your workstation

The easy way to install KubeInvader is run it on you workstation.

Create .KubeInv.json file on your home. This is an example:

```
{
  "token": ".....",
  "endpoint": "https://rancher.accolli.it:6443",
  "namespace": "namespace1,namespace2"
}
```
* [MacOS](https://github.com/lucky-sideburn/KubeInvaders/releases/download/0.2.8-ui/x86_64-darwin.zip)
* [Linux](https://github.com/lucky-sideburn/KubeInvaders/releases/download/0.2.8-ui/x86_64-linux.zip)

### Install KubeInvaders on Openshift

To Install KubeInvaders on your Openshift Cluster clone this repo and launch the following commands:

```bash
oc create clusterrole kubeinvaders-role --verb=watch,get,delete,list --resource=pods,pods/log

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

### How the configuration of KubeInvaders DeploymentConfig should be (remember to use your TARGET_NAMESPACE and ROUTE_HOST)

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/images/dcenv.png)
