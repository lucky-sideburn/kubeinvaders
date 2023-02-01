#!/bin/sh

if [ ! -z "$K8S_TOKEN" ];then
  echo 'Found K8S_TOKEN... using K8S_TOKEN instead of TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)'
  export TOKEN=$K8S_TOKEN
else
  # Source the service account token from the container directly.
  export TOKEN="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)"
fi
export PYTHONWARNINGS="ignore:Unverified HTTPS request"

python3 /opt/logs_loop/start.py https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT_HTTPS} &

while true
do
  pgrep -a -f -c "^python3.*logs_loop.*$" > /dev/null || ( python3 /opt/logs_loop/start.py https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT_HTTPS} & )
  sleep 2
done
