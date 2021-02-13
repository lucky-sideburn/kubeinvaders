docker build . -t docker.io/luckysideburn/kubeinvaders:purejs
docker push docker.io/luckysideburn/kubeinvaders:purejs
docker tag docker.io/luckysideburn/kubeinvaders:purejs docker.io/luckysideburn/kubeinvaders:latest
docker push docker.io/luckysideburn/kubeinvaders:latest
