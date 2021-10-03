# KubeInvaders Helm Chart Repository

## Usage

```bash
helm repo add kubeinvaders https://lucky-sideburn.github.io/helm-charts/

kubectl create namespace kubeinvaders

# Install new and full open-source version
helm install kubeinvaders --set-string target_namespace="namespace1\,namespace2" \
-n kubeinvaders kubeinvaders/kubeinvaders --set ingress.hostName=kubeinvaders.io
```

## Helm Values

| Variable            | Description                            |
| ------------------- | -------------------------------------- |
| image.tag           | Specify tag of KubeInvaders to deploy  |
| ingress.hostName    | URL used for ingress                   |
| target_namespace    | namespaces to take under control       |
| extraEnv            | Extra environment variables for pod    |
