#!/bin/bash

docker build . -t docker.io/luckysideburn/kubeinvaders:develop
docker push docker.io/luckysideburn/kubeinvaders:develop
