#!/bin/bash

buildah build --format=docker -t docker.io/luckysideburn/kubeinvaders:develop .
#buildah push docker.io/luckysideburn/kubeinvaders:develop
#kubectl create namespace kubeinvaders
#export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
#helm upgrade kubeinvaders --set-string target_namespace="namespace1\,namespace2" -n kubeinvaders ./helm-charts/kubeinvaders/ --set ingress.hostName=kubeinvaders.io --set image.tag=develop -i
#kubectl delete pod --force --grace-period=0 --all -n kubeinvaders
