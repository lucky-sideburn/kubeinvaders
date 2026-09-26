# KubeInvaders with Podman and MiniKube

## 1. Start MiniKube

```bash
minikube start
```

## 2. Get the API endpoint and the CA

```bash
kubectl cluster-info
# Kubernetes control plane is running at https://<minikube-ip>:8443

cat ~/.minikube/ca.crt
```

## 3. Create the RBAC and a token

```bash
kubectl apply -f manifests/kubeinvaders-rbac.yaml
kubectl create token kinv-sa -n kubeinvaders --duration=24h
```

## 4. Create the target namespaces

```bash
kubectl create namespace namespace1
kubectl create namespace namespace2
```

## 5. Run KubeInvaders

```bash
podman run -p 8080:8080 --network=host docker.io/luckysideburn/kubeinvaders:latest
```

Open http://localhost:8080 and fill in the **Kubernetes Connection** form with the endpoint, the token, the namespaces and the CA from the previous steps.

On macOS the container runs inside the Podman Machine VM, which may not reach the MiniKube network. If the connection test fails, check that the VM can reach `<minikube-ip>:8443`.
