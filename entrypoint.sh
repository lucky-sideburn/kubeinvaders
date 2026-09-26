#!/bin/bash

set -m

# Embedded KWOK demo cluster. KWOK_ENABLED=auto (default) starts it only when
# no real cluster is configured: no K8S_TOKEN and not running inside a pod.
KWOK_ENABLED="${KWOK_ENABLED:-auto}"
if [ "$KWOK_ENABLED" = "auto" ]; then
  if command -v kwokctl >/dev/null && [ -z "$K8S_TOKEN" ] && [ ! -f /var/run/secrets/kubernetes.io/serviceaccount/token ]; then
    KWOK_ENABLED=true
  else
    KWOK_ENABLED=false
  fi
fi

rm -f /opt/kwok/connection.json /opt/kwok/kwok.env
if [ "$KWOK_ENABLED" = "true" ]; then
  if ! /opt/kwok/start-kwok.sh; then
    echo "[kwok] Failed to start the embedded KWOK cluster"
    exit 1
  fi
  source /opt/kwok/kwok.env
  echo "=============================================================================="
  echo " KubeInvaders is connected to the built-in KWOK demo cluster (simulated pods)."
  echo " To use a real cluster: fill in the Kubernetes Connection form in the web"
  echo " console, or restart the container with -e KWOK_ENABLED=false and"
  echo " K8S_TOKEN, KUBERNETES_SERVICE_HOST, KUBERNETES_SERVICE_PORT_HTTPS, NAMESPACE."
  echo "=============================================================================="
fi

if [ ! -z "$K8S_TOKEN" ];then
  echo 'Found K8S_TOKEN... using K8S_TOKEN instead of TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)'
  export TOKEN=$K8S_TOKEN
else
  # Source the service account token from the container directly.
  export TOKEN="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token 2>/dev/null)"
  if [ -z "$TOKEN" ]; then
    echo "No Kubernetes token configured: connect to your cluster from the Kubernetes Connection form in the web console."
  fi
fi

trap "exit" INT TERM ERR
trap "kill 0" EXIT

redis-server /etc/redis/redis.conf &
until redis-cli -h 127.0.0.1 -p 6379 ping 2>/dev/null | grep -q PONG; do sleep 0.1; done
/opt/metrics_loop/start.sh &
# /opt/logs_loop/start.sh &
nginx -c /etc/nginx/nginx.conf -g 'daemon off;' &
wait
