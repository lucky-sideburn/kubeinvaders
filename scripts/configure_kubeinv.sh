# Set a spefic KUBECONFIG if you have different contexts
# export KUBECONFIG=<path>

NAMESPACES="default,namespace1"
K8S_ENDPOINT="https://91A9752B6718D1E61824994D466EB574.gr7.eu-central-1.eks.amazonaws.com"

SERVICE_ACCOUNT="kubeinvaders"

kubectl --insecure-skip-tls-verify create sa kubeinvaders -n default

cat <<EOF > ./kubeinvader-rbac.yaml
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: kubeinvaders
  labels:
    app: kubeinvaders
rules:
- apiGroups: [""]
  resources: ["pods","pods/log"]
  verbs: ["get", "watch", "list", "delete"]
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: kubeinvaders
  labels:
    app: kubeinvaders
subjects:
- kind: ServiceAccount
  name: kubeinvaders
  namespace: default
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: kubeinvaders
EOF

kubectl --insecure-skip-tls-verify create -f ./kubeinvader-rbac.yaml -n default
SECRET=$(kubectl --insecure-skip-tls-verify get serviceaccount ${SERVICE_ACCOUNT} -n default -o json | jq -Mr '.secrets[].name | select(contains("token"))')
TOKEN=$(kubectl --insecure-skip-tls-verify get secret ${SECRET} -n default -o json | jq -Mr '.data.token' | base64 -d)

JSON_STRING=$( jq -n \
                  --arg token "$TOKEN" \
                  --arg endpoint "$K8S_ENDPOINT" \
                  --arg namespace "$NAMESPACES" \
                  '{token: $token, endpoint: $endpoint, namespace: $namespace}' )

echo $JSON_STRING > ~/.KubeInv.json
