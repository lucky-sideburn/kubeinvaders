#!/bin/bash

docker build . -t docker.io/luckysideburn/chaos-exec:latest
docker push docker.io/luckysideburn/chaos-exec:latest
