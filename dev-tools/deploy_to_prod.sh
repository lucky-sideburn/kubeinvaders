docker build . -t docker.io/luckysideburn/kubeinvaders:$1
docker tag docker.io/luckysideburn/kubeinvaders:$1 docker.io/luckysideburn/kubeinvaders:latest
docker push docker.io/luckysideburn/kubeinvaders:$1
docker push docker.io/luckysideburn/kubeinvaders:latest
