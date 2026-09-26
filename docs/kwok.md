# Built-in KWOK demo cluster

The KubeInvaders image embeds a demo Kubernetes cluster powered by [KWOK](https://kwok.sigs.k8s.io/), so you can play without any real cluster.

etcd, kube-apiserver, kube-controller-manager, kube-scheduler and kwok run as plain processes inside the KubeInvaders container: no extra containers and no `--privileged` needed.

```bash
podman run --rm -p 8080:8080 docker.io/luckysideburn/kubeinvaders:latest
```

Open http://localhost:8080: the web console is already connected to the demo cluster.

## When does it start?

| `KWOK_ENABLED` | Behavior |
| --- | --- |
| `auto` (default) | Starts only when no cluster is configured: no `K8S_TOKEN` and not running inside a Kubernetes pod |
| `true` | Always starts |
| `false` | Never starts: connect your own cluster from the web console or with environment variables |

## Using a real cluster

Some users want to play against a real, external cluster. There are two options:

- **Switch from the web console:** fill in the **Kubernetes Connection** form with your cluster endpoint, token, namespaces and CA (or load a KUBECONFIG file) and press **Save Connection**. The browser remembers your choice; the **Use KWOK demo cluster** button brings you back to the demo cluster.
- **Disable the demo cluster:** start the container with `-e KWOK_ENABLED=false`, then connect from the web console or pass `K8S_TOKEN`, `KUBERNETES_SERVICE_HOST`, `KUBERNETES_SERVICE_PORT_HTTPS` and `NAMESPACE`. With `KWOK_ENABLED=false` the demo cluster does not use any CPU or memory.

See [Connect Your Cluster](../README.md#connect-your-cluster) for the RBAC and the token.

## What you get

- 3 fake nodes (change it with `-e KWOK_NODES=<n>`)
- demo Deployments in `namespace1` and `namespace2`
- a ServiceAccount with the same permissions as [manifests/kubeinvaders-rbac.yaml](../manifests/kubeinvaders-rbac.yaml)

## Building

```bash
podman build -t kubeinvaders:latest .
```

No `--platform` flag is needed: KWOK is downloaded for the architecture of the image. To build a slim image without KWOK (about 460 MB smaller):

```bash
podman build --build-arg WITH_KWOK=false -t kubeinvaders:slim .
```

## Limitations

- Pods are simulated: they can be killed and are recreated by their ReplicaSets, but they run no real containers, so pod logs are empty.
- Chaos Jobs against nodes are created but do not really run.
- The cluster is recreated from scratch every time the container starts.
- The demo cluster uses about 400 MB of memory.
