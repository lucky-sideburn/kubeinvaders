#!/bin/bash

docker build . -t docker.io/luckysideburn/kubeinvaders:develop_local
docker push docker.io/luckysideburn/kubeinvaders:develop_local
