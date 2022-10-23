#! /bin/bash
secret=$(kubectl get secret -n kubeinvaders | grep 'service-account-token' | grep kubeinvaders | awk '{ print $1}')
token=$(kubectl describe secret $secret -n kubeinvaders | grep 'token:' | awk '{ print $2}')
ip=$(ip address show eth0 | grep inet | grep -v inet6 | awk '{ print $2 }' | awk -F/ '{ print $1 }')
export TOKEN=$token
export DEV=true
export PYTHONWARNINGS="ignore:Unverified HTTPS request"
python3 start.py https://$ip:6443
