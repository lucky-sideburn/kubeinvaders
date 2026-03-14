#!/bin/sh

if [ ! -z "$K8S_TOKEN" ];then
  echo 'Found K8S_TOKEN... using K8S_TOKEN instead of TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)'
  export TOKEN=$K8S_TOKEN
else
  # Source the service account token from the container directly.
  export TOKEN="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)"
fi
export PYTHONWARNINGS="ignore:Unverified HTTPS request"

RESOLVED_ENDPOINT=""

# 1) Endpoint configured from the web console (persisted by /kube/healthz in Redis)
REDIS_ENDPOINT=$(python3 - <<'PY'
import redis
try:
    r = redis.Redis(unix_socket_path='/tmp/redis.sock', decode_responses=True)
    v = r.get('k8s_api_endpoint')
    print(v.strip() if v else '')
except Exception:
    print('')
PY
)

if [ ! -z "$REDIS_ENDPOINT" ]; then
  RESOLVED_ENDPOINT="$REDIS_ENDPOINT"
  echo "Using k8s_api_endpoint from Redis: $RESOLVED_ENDPOINT"
elif [ ! -z "$ENDPOINT" ]; then
  RESOLVED_ENDPOINT="$ENDPOINT"
  echo "Using ENDPOINT env var: $RESOLVED_ENDPOINT"
else
  RESOLVED_ENDPOINT="https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT_HTTPS}"
  echo "Using in-cluster endpoint: $RESOLVED_ENDPOINT"
fi

python3 /opt/logs_loop/start.py "$RESOLVED_ENDPOINT" &

while true
do
  pgrep -a -f -c "^python3.*logs_loop.*$" > /dev/null || ( python3 /opt/logs_loop/start.py "$RESOLVED_ENDPOINT" & )
  sleep 2
done
