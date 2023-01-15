#!/bin/bash

docker build . -t docker.io/luckysideburn/chaos-exec:latest
docker tag docker.io/luckysideburn/chaos-exec:latest docker.io/luckysideburn/chaos-exec:v1.0.4
docker push docker.io/luckysideburn/chaos-exec:latest
docker push docker.io/luckysideburn/chaos-exec:v1.0.4
