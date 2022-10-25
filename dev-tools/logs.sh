#! /bin/bash
kubectl logs $(kubectl get pods -n kubeinvaders | grep 'kubeinvaders-' | awk '{ print $1 }') -n kubeinvaders -f
