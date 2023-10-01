image_version=$(cat ./README.md | grep 'image.tag' | awk -F= '{ print $4 }')
echo $image_version
podman build . -t docker.io/luckysideburn/kubeinvaders:$image_version
podman tag docker.io/luckysideburn/kubeinvaders:$image_version docker.io/luckysideburn/kubeinvaders:latest
podman tag docker.io/luckysideburn/kubeinvaders:$image_version docker.io/luckysideburn/kubeinvaders:develop
podman push docker.io/luckysideburn/kubeinvaders:$image_version
podman push docker.io/luckysideburn/kubeinvaders:latest
