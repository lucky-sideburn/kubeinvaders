#! /bin/bash

echo "Release new version of the KubeInvaders Helm Chart"

helm package ../helm-charts/kubeinvaders/
tar_gz_name=$(ls -art | grep "kubeinvaders.*.tgz")
cp $tar_gz_name ../../helm-charts/
rm -f $tar_gz_name
cd ../../helm-charts/
helm repo index .
