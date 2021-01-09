#!/bin/bash

K8S_URL=$1
TOKEN=$2
NODE_NAME=$3
NAMESPACE=$4
RAND=$(openssl rand -hex 4)
YAML_FILE=/tmp/kubeinvaders-chaos-node-$RAND.yaml
CLEANER_SCRIPT=/tmp/$RAND-cleaner.sh
# Very temporary work-around
KUBE=$(cat /etc/nginx/conf.d/KubeInvaders.conf | grep proxy_pass | head -n1 | awk '{ print $2 }' | sed 's/;//g')

# Only for debugging...
# echo "$TOKEN $KUBE $RAND $NODE_NAME" > /tmp/foo

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
    metadata:
      labels:
        app: kubeinvaders
        approle: chaosnode
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

cat <<EOF > $CLEANER_SCRIPT
#!/bin/sh
for i in $(kubectl get jobs -l app=kubeinvaders -l approle=chaosnode -o=jsonpath='{.items[?(@.status.succeeded==1)].metadata.name}' --token=${TOKEN} --server=${KUBE} -n ${NAMESPACE} --insecure-skip-tls-verify=true)
do
  kubectl delete job \$i --token=${TOKEN} --server=${KUBE} --insecure-skip-tls-verify=true -n $NAMESPACE >> /tmp/kubectl.log 2>&1
done
  
for i in $(kubectl get pods -l app=kubeinvaders -l approle=chaosnode --field-selector=status.phase==Succeeded --token=${TOKEN} --server=${KUBE} -n ${NAMESPACE} --insecure-skip-tls-verify=true | grep -v NAME | awk '{ print $1 }')
do
  kubectl delete pod \$i --token=${TOKEN} --server=${KUBE} --insecure-skip-tls-verify=true -n $NAMESPACE >> /tmp/kubectl.log 2>&1 
done

rm -f $YAML_FILE
rm -f $CLEANER_SCRIPT
EOF

chmod +x $CLEANER_SCRIPT

sed -i  "s/node_name_placeholder/$NODE_NAME/g" $YAML_FILE
sed -i  "s/random_suffix/$RAND/g" $YAML_FILE

tsp bash -c "kubectl create -f $YAML_FILE --token=${TOKEN} --server=${KUBE} -n ${NAMESPACE} --insecure-skip-tls-verify=true >> /tmp/kubectl.log 2>&1"
tsp bash -c "./$CLEANER_SCRIPT"

