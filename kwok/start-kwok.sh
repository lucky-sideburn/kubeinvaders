#!/bin/bash
# Start the embedded KWOK cluster and seed it with demo workloads.
# Writes the connection settings to /opt/kwok/kwok.env (sourced by entrypoint.sh)
# and /opt/kwok/connection.json (served by nginx at /kube/kwok for the web console).

set -e

KWOK_DIR=/opt/kwok
KWOK_PORT=6443
KWOK_NODES="${KWOK_NODES:-3}"
KWOK_NAMESPACES="${NAMESPACE:-namespace1,namespace2}"

echo "[kwok] Starting embedded KWOK cluster..."
kwokctl delete cluster >/dev/null 2>&1 || true
BIN="$KWOK_DIR/bin"
kwokctl create cluster --runtime binary --kube-apiserver-port "$KWOK_PORT" --wait 2m \
  --etcd-binary "$BIN/etcd" \
  --kube-apiserver-binary "$BIN/kube-apiserver" \
  --kube-controller-manager-binary "$BIN/kube-controller-manager" \
  --kube-scheduler-binary "$BIN/kube-scheduler" \
  --kwok-controller-binary "$BIN/kwok"

export KUBECONFIG=/root/.kube/config
mkdir -p "$(dirname "$KUBECONFIG")"
kwokctl get kubeconfig > "$KUBECONFIG"

echo "[kwok] Creating ${KWOK_NODES} fake nodes..."
for i in $(seq 1 "$KWOK_NODES"); do
  sed "s/__NODE_NAME__/kwok-node-${i}/" "$KWOK_DIR/manifests/node.yaml.tpl" | kubectl apply -f -
done

kubectl apply -f "$KWOK_DIR/manifests/rbac.yaml"
kubectl apply -f "$KWOK_DIR/manifests/demo-workloads.yaml"

TOKEN=$(kubectl -n kubeinvaders create token kubeinvaders --duration=8760h)

cat > "$KWOK_DIR/kwok.env" <<EOF
export K8S_TOKEN='$TOKEN'
export KUBERNETES_SERVICE_HOST=127.0.0.1
export KUBERNETES_SERVICE_PORT_HTTPS=$KWOK_PORT
export NAMESPACE='$KWOK_NAMESPACES'
export DISABLE_TLS='${DISABLE_TLS:-true}'
EOF

jq -n \
  --arg id "$(cat /proc/sys/kernel/random/uuid)" \
  --arg endpoint "https://127.0.0.1:${KWOK_PORT}" \
  --arg token "$TOKEN" \
  --arg namespaces "$KWOK_NAMESPACES" \
  --rawfile ca_cert /root/.kwok/clusters/kwok/pki/ca.crt \
  '{enabled: true, id: $id, endpoint: $endpoint, token: $token, namespaces: $namespaces, ca_cert: $ca_cert}' \
  > "$KWOK_DIR/connection.json"
