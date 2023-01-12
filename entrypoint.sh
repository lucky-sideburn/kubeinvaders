#!/bin/bash

set -m

if [ ! -z "$K8S_TOKEN" ];then
  echo 'Found K8S_TOKEN... using K8S_TOKEN instead of TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)'
  export TOKEN=$K8S_TOKEN
else
  # Source the service account token from the container directly.
  export TOKEN="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)"
fi

trap "exit" INT TERM ERR
trap "kill 0" EXIT

redis-server /etc/redis/redis.conf &
/opt/metrics_loop/start.sh &
/opt/logs_loop/start.sh &
nginx -c /etc/nginx/nginx.conf -g 'daemon off;' &
wait
