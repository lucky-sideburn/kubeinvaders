#!/bin/bash

docker build . -t docker.io/luckysideburn/kubeinvaders:develop_local

docker rm -f kinv
docker run -p 8080:8080 \
--name kinv \
--env K8S_TOKEN=$KINV_TOKEN  \
--env ENDPOINT=localhost:8080 \
--env INSECURE_ENDPOINT=true \
--env KUBERNETES_SERVICE_HOST=$KINV_K8S_IP \
--env KUBERNETES_SERVICE_PORT_HTTPS=6443 \
--env NAMESPACE=namespace1,datadog \
-v html5:/var/www/test \
luckysideburn/kubeinvaders:develop_local
