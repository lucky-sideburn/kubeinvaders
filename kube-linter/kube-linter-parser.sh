#!/bin/sh

if [ ! -z "$K8S_TOKEN" ];then
  echo 'Found K8S_TOKEN... using K8S_TOKEN instead of TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)'
  export TOKEN=$K8S_TOKEN
else
  # Source the service account token from the container directly.
  export TOKEN="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)"
fi

for i in $(curl -k -s https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT_HTTPS}/api/v1/namespaces/${1}/pods/ \
--header "Authorization: Bearer ${TOKEN}" | jq -rM '.items[].metadata.name')
do
  curl -k -s https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT_HTTPS}/api/v1/namespaces/${1}/pods/${i} \
  --header "Authorization: Bearer ${TOKEN}" > /tmp/kube-linter-pods/${i}.yaml
done

kube-linter lint /tmp/kube-linter-pods/* --format json