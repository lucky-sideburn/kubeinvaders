#!/bin/sh
if [ ! -z "$K8S_TOKEN" ];then
  echo 'Found K8S_TOKEN... using K8S_TOKEN instead of TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)'
  export TOKEN=$K8S_TOKEN
else
  # Source the service account token from the container directly.
  export TOKEN="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)"
fi

# TODO: use a sidecar
redis-server /etc/redis/redis.conf &

# TODO: use a sidecar
bash /opt/metrics_loop/start.sh &
bash /opt/logs_loop/start.sh &

echo '<p>waiting for logs...</p>' > /var/www/html/chaoslogs.html

nginx -c /etc/nginx/nginx.conf -g 'daemon off;'
