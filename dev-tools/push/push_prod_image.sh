image_version="v1.9.7"
echo $image_version

podman build . -t local/kubeinvaders:develop

podman tag local/kubeinvaders:develop docker.io/luckysideburn/kubeinvaders:$image_version 
podman tag docker.io/luckysideburn/kubeinvaders:$image_version docker.io/luckysideburn/kubeinvaders:latest
podman tag docker.io/luckysideburn/kubeinvaders:$image_version docker.io/luckysideburn/kubeinvaders:develop
podman tag docker.io/luckysideburn/kubeinvaders:$image_version 10.10.10.3:5000/kubeinvaders:v1.9.7


podman push docker.io/luckysideburn/kubeinvaders:$image_version
podman push docker.io/luckysideburn/kubeinvaders:latest
podman push 10.10.10.3:5000/kubeinvaders:$image_version
