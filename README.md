# KubeInvaders

### Chaos Engineering Tool for Kubernetes and Openshift

KubeInvaders is a game and it has been written with Defold (https://www.defold.com/).

Through KubeInvaders you can stress your Openshift cluster in a fun way and check how it is resilient.

**Actually this is an alpha release and it has been tested only with Openshift 3.9**

### How KubeInvaders Works

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/kubeinvaders.gif)

### Install KubeInvaders on Openshift

If you deploy KubeInvaders on Openshift please configure corsAllowedOrigins in your /etc/origin/master/master-config.yaml

```yaml
 corsAllowedOrigins:
   - (?i)//kubeinvaders.org(:|\z)
```

To Install KubeInvaders on your Openshift Cluster clone this repo and launch the following commands:

```bash
TARGET_NAMESPACE=foobar
ENDPOINT=https://ocmaster39:8443
ROUTE_URL=kubeinvaders.org
oc new-project kubeinvaders --display-name='KubeInvaders'
oc create sa kubeinvaders -n kubeinvaders
oc create sa kubeinvaders -n $TARGET_NAMESPACE
oc adm policy add-role-to-user edit -z kubeinvaders -n $TARGET_NAMESPACE

TOKEN=$(oc describe secret -n $TARGET_NAMESPACE $(oc describe sa kubeinvaders -n $TARGET_NAMESPACE | grep Tokens | awk '{ print $2}') | grep 'token:'| awk '{ print $2}')
oc process -f openshift/KubeInvaders.yaml -p ROUTE_URL=$ROUTE_URL -p TARGET_NAMESPACE=$TARGET_NAMESPACE -p ENDPOINT=$ENDPOINT TOKEN=$TOKEN | oc create -f -
```

### Donwload KubeInvaders - External to Openshift (macOS or Linux clients)

Please check the [releases](https://github.com/lucky-sideburn/KubeInvaders/releases) page.

### How Configure KubeInvaders - Running on Openshift

Change the following variables inside the kubeinvaders DeploymentConfig

* TARGET_NAMESPACE
* ENDPOINT
* TOKEN

### How Configure KubeInvaders - Local execution

create the file **$HOME/.KubeInv.json** (the token should have permission for list and delete pods into the namespace).

```
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJmb29iYXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlY3JldC5uYW1lIjoia3ViZWludmFkZXJzLXRva2VuLTJqbXF0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6Imt1YmVpbnZhZGVycyIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6ImRhNDc4MmQ2LTViMDgtMTFlOS05MmQ1LTIyM2Q5NTVhNzBlOSIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpmb29iYXI6a3ViZWludmFkZXJzIn0.dfw0OhfPsJmL09aOfY8Iw3zs-Wp0FgaUPRwGiXo3u-RQRJubzMvoPzxc97JayR-VmBTW8lMracdD2EhrHzaeA7ntH0TSKCWq6LTxaOa70IvPdAR2aa5oaRPHJ0SslcBr5WdNXFcOCgy9lLT9PIQkjRQvKos9NMxrTDJolqdPuMvTdAZLy1kiNURzXFW2ImHkUduOzJRi0xwy291YzOD5wqKsB9wnHGo74RNI8bd68wV",
  "endpoint": "https://ocmaster39:8443",
  "namespace": "foobar"
}
```
### TO-DO

* Code style improvment 
* Make an Openshift Template within all resources
* Test KubeInvaders on Kubernetes




