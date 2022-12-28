#!/bin/bash
kubectl create namespace kubeinvaders
helm delete kubeinvaders -n kubeinvaders
helm install kubeinvaders --set-string config.target_namespace="namespace1\,namespace2" -n kubeinvaders ./helm-charts/kubeinvaders/ --set ingress.enabled=true --set ingress.hostName=kubeinvaders.io --set deployment.image.tag=develop
kubectl delete pod --force --grace-period=0 --all -n kubeinvaders

