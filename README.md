# KubeInvaders

### Chaos Engineering Tool for Kubernetes and Openshift

KubeInvaders is a game and it has been written with Defold (https://www.defold.com/).

Through KubeInvaders you can stress your Openshift cluster in a fun way and check how it is resilient.

### How KubeInvaders Works

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/kubeinvaders.gif)

### Install Kubernetes on Openshift

To Install KubeInvaders on your Openshift Cluster launch the following commands

```bash
# replace the followint variables with the right values
TARGET_NAMESPACE=kubeinvaders
ENDPOINT=https://192.168.99.100:8443
ROUTE_URL=kubeinvaders.org
# https://ionicframework.com/docs/faq/cors
# If you deploy KubeInvaders on Openshift please configure corsAllowedOrigins in your /etc/origin/master/master-config.yaml
# corsAllowedOrigins:
# - (?i)//kubeinvaders.org(:|\z)


# TO DO: put all stuff in Openshift Template
oc new-project kubeinvaders --display-name='KubeInvaders'
oc create sa kubeinvaders -n kubeinvaders
oc create role podinvanders --verb=delete,get --resource=pod -n $TARGET_NAMESPACE
oc adm policy add-role-to-user podinvanders kubeinvaders --role-namespace=$TARGET_NAMESPACE -n $TARGET_NAMESPACE
TOKEN=$(oc describe secret $(oc describe sa kubeinvaders -n kubeinvaders | grep Tokens | awk '{ print $2}') | grep 'token:'| awk '{ print $2}')

oc process -f openshift/KubeInvaders.yaml -p ROUTE_URL=$ROUTE_URL -p TARGET_NAMESPACE=$TARGET_NAMESPACE -p ENDPOINT=$ENDPOINT TOKEN=$TOKEN | oc create -f -

oc create role kubeinvaders --verb=delete,get --resource=pod -n foobar
oc adm policy add-role-to-user kubeinvaders kubeinvaders -n foobar
TOKEN=$(oc describe secret -n kubeinvaders $(oc describe sa kubeinvaders -n kubeinvaders | grep Tokens | awk '{ print $2}') | grep 'token:'| awk '{ print $2}')

#https://ionicframework.com/docs/faq/cors


```

### Donwload KubeInvaders - External to Openshift (macOS or Linux clients)

Please check the [releases](https://github.com/lucky-sideburn/KubeInvaders/releases) page.

### How Configure KubeInvaders - Running on Openshift

Change the following variables inside the kubeinvaders DeploymentConfig

* TARGET_NAMESPACE
* ENDPOINT
* TOKEN

### How Configure KubeInvaders - Local execution

create the file **.KubeInv.json** (the token should have permission for list and delete pods into the namespace).

**Where should be .KubeInv.conf?**

Start the game and it will say to you where

![Alt Text](https://github.com/lucky-sideburn/KubeInvaders/blob/master/conf.png)


### TO-DO

* Code style improvment 
* Make an Openshift Template within all resources
* Test KubeInvaders on Kubernetes




