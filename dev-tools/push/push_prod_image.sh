image_version=$(cat ./README.md | grep 'image.tag' | awk -F= '{ print $4 }')
echo $image_version
docker build . -t docker.io/luckysideburn/kubeinvaders:$image_version
docker tag docker.io/luckysideburn/kubeinvaders:$image_version docker.io/luckysideburn/kubeinvaders:latest
docker tag docker.io/luckysideburn/kubeinvaders:$image_version docker.io/luckysideburn/kubeinvaders:develop
docker push docker.io/luckysideburn/kubeinvaders:$image_version
docker push docker.io/luckysideburn/kubeinvaders:latest
