#! /bin/bash
kubectl exec -it $(kubectl get pods -n kubeinvaders | grep 'kubeinvaders-' | awk '{ print $1 }') -n kubeinvaders bash

