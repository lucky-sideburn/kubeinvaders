# KubeInvaders Helm Chart Repository

## Usage

```bash
helm repo add kubeinvaders https://lucky-sideburn.github.io/helm-charts/

kubectl create namespace kubeinvaders

helm install -n kubeinvaders kubeinvaders kubeinvaders/kubeinvaders \
  --set-string config.target_namespace="namespace1\,namespace2" \
  --set ingress.enabled=true --set ingress.hostName=kubeinvaders.io
```

## Values

See the [values.yaml](./values.yaml) for a full list of configuration options.
