#! /bin/bash

echo "Try to install the latest version of helm chart"

image_version=$(cat ../README.md | grep 'image.tag' | awk -F= '{ print $3 }')
helm_chart_version=$(cat ../helm-charts/kubeinvaders/Chart.yaml | grep 'version' | awk '{ print $2 }')

echo "Deploy Helm Chart Version ${helm_chart_version}"
echo "Deploy Image Version ${image_version}"

kubectl create namespace namespace1
kubectl create namespace namespace2

kubectl delete --all -n namespace1
kubectl delete --all -n namespace2

helm repo add kubeinvaders https://lucky-sideburn.github.io/helm-charts/
helm repo update

kubectl create namespace kubeinvaders
helm delete kubeinvaders -n kubeinvaders

helm install kubeinvaders --set-string target_namespace="namespace1\,namespace2" --set ingress.enabled=true --set ingress.hostName=kubeinvaders.io \
-n kubeinvaders ../helm-charts/kubeinvaders --set image.tag="${image_version}"
