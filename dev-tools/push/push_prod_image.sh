image_version="v1.9.6"
echo $image_version

#podman build . -t docker.io/luckysideburn/kubeinvaders:$image_version
podman tag local/kubeinvaders:develop docker.io/luckysideburn/kubeinvaders:$image_version 
podman tag docker.io/luckysideburn/kubeinvaders:$image_version docker.io/luckysideburn/kubeinvaders:latest
podman tag docker.io/luckysideburn/kubeinvaders:$image_version docker.io/luckysideburn/kubeinvaders:develop
podman push docker.io/luckysideburn/kubeinvaders:$image_version
podman push docker.io/luckysideburn/kubeinvaders:latest
