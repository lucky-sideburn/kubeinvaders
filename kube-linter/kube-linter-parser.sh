#!/bin/sh

if [ ! -z "$K8S_TOKEN" ];then
  #echo 'Found K8S_TOKEN... using K8S_TOKEN instead of TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)'
  export TOKEN=$K8S_TOKEN
else
  #Source the service account token from the container directly.
  export TOKEN="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)"
fi

for i in $(curl -k -s https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT_HTTPS}/api/v1/namespaces/${1}/pods/ \
--header "Authorization: Bearer ${TOKEN}" | jq -rM '.items[].metadata.name')
do
  curl -k -s https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT_HTTPS}/api/v1/namespaces/${1}/pods/${i} \
  --header "Authorization: Bearer ${TOKEN}" > /tmp/kube-linter-pods/${i}.yaml
done

#date_now=$(date)
#echo "${date_now} | Namespace: ${i} | Token: ${K8S_TOKEN} | KUBERNETES_SERVICE_HOST: ${KUBERNETES_SERVICE_HOST} | KUBERNETES_SERVICE_PORT_HTTPS: ${KUBERNETES_SERVICE_PORT_HTTPS}" >>  /tmp/linter.log

return_json=$(kube-linter lint /tmp/kube-linter-pods/* --format json |  jq '[.Reports[] | {message: .Diagnostic.Message, remediation: .Remediation, k8s_object: .Object.K8sObject.Name, namespace: .Object.K8sObject.Namespace, kind: .Object.K8sObject.GroupVersionKind.Kind}]' | sed "s/{/<div class='row log-row' style='margin-top: 2%;'>/g" | sed "s/}/<\/div>/g" | sed "s/<\/div>,/<\/div><hr style='margin-top: 2%;'>/g" | sed "s/\[//g" | sed "s/\]//g")
echo "<p>START KUBELINTER</p><div class='row log-row' style='margin-top: 2%;'>${return_json}</div><p style='margin-top: 2%;'>END KUBELINTER</p>"