kubectl create namespace kubeinvaders
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
helm upgrade kubeinvaders --set-string target_namespace="namespace1\,namespace2" -n kubeinvaders ./helm-charts/kubeinvaders/ --set ingress.hostName=kubeinvaders.io --set image.tag=v1.7 -i
kubectl delete pod --all -n kubeinvaders --force --grace-period=0
