# Troubleshooting

- **No aliens?** Check that the namespaces configured in the UI (e.g. `namespace1,namespace2`) exist and contain pods, then follow [issue #100](https://github.com/lucky-sideburn/kubeinvaders/issues/100#event-18433067619).
- **Connection test fails?** Check the endpoint, the token and, for self-signed clusters, the CA certificate. Open the browser developer console to see the failing requests.
- **Seeing pods like `frontend-...` or nodes like `kwok-node-1` that are not in your cluster?** You are on the built-in KWOK demo cluster: connect your cluster from the Kubernetes Connection form or start the container with `-e KWOK_ENABLED=false` (see [kwok.md](./kwok.md)).
- **EKS:** KubeInvaders is known to have problems with EKS ServiceAccounts.
- To debug, check the container logs (`podman logs <container>`), query the API directly with `curl "http://localhost:8080/kube/pods?action=list&namespace=namespace1"`, or use the `latest_debug` image.

Open an issue with the logs attached or write to luckysideburn[at]gmail[dot]com.
