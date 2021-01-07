#!/bin/bash

K8S_URL=$1
TOKEN=$2
NODE_NAME=$3
NAMESPACE=$4
RAND=$(openssl rand -hex 4)
YAML_FILE=/tmp/kubeinvaders-chaos-node-$RAND.yaml

# Very temporary work-around
KUBE=$(cat /etc/nginx/conf.d/KubeInvaders.conf | grep proxy_pass | head -n1 | awk '{ print $2 }' | sed 's/;//g')

echo "$TOKEN $KUBE $RAND $NODE_NAME" > /tmp/foo

cat <<EOF >$YAML_FILE
apiVersion: batch/v1
kind: Job
metadata:
  name: kubeinvaders-chaos-random_suffix
  labels:
    app: kubeinvaders
    approle: chaosnode
spec:
  template:
    spec:
      containers:
      - name: kubeinvaders-chaos-node
        image: docker.io/luckysideburn/kubeinvaders-stress-ng:latest
        command: ["stress-ng", "--cpu", "4",  "--io",  "2",  "--vm", "1", "--vm-bytes", "1G", "--timeout", "10s", "--metrics-brief"]
      restartPolicy: Never
      nodeSelector:
        kubernetes.io/hostname: node_name_placeholder
  backoffLimit: 1
EOF

sed -i  "s/node_name_placeholder/$NODE_NAME/g" $YAML_FILE
sed -i  "s/random_suffix/$RAND/g" $YAML_FILE

kubectl create -f $YAML_FILE --token=${TOKEN} --server=${KUBE}  -n ${NAMESPACE} --insecure-skip-tls-verify=true >> /tmp/kubectl.log 2>&1

kubectl delete job -l app=kubeinvaders -l approle=chaosnode -o=jsonpath='{.items[?(@.status.succeeded==1)].metadata.name}' --token=${TOKEN} --server=${KUBE} -n $NAMESPACE >> /tmp/kubectl.log 2>&1
kubectl delete pod --token=${TOKEN} --server=${KUBE} -l app=kubeinvaders -l approle=chaosnode --field-selector=status.phase==Succeeded -n $NAMESPACE >> /tmp/kubectl.log 2>&1

rm -f $YAML_FILE
