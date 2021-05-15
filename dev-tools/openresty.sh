#!/bin/sh

echo "script for developing on OpenResty component of KubeInvaders"

docker build . -t kubeinvaders-dev
(docker ps | grep kubeinvaders-openresty) && sudo docker rm kubeinvaders-openresty -f
docker run -d -v $PWD/scripts:/usr/local/openresty/nginx/conf/kubeinvaders -p 8080:8080 \
--restart always --name kubeinvaders-openresty --env KUBERNETES_SERVICE_HOST=192.168.178.35 --env KUBERNETES_SERVICE_PORT=6443 --env ROUTE_HOST=192.168.178.35 --env ENDPOINT=192.168.178.35 --env K8S_TOKEN=$K8S_TOKEN --env NAMESPACE="namespace1,namespace2" kubeinvaders-dev
