#!/bin/sh

# Very temporary work-around
KUBE=$(cat /etc/nginx/conf.d/KubeInvaders.conf | grep proxy_pass | head -n1 | awk '{ print $2 }' | sed 's/;//g')

POD_FILE=/tmp/${3}.json

curl -XGET "${KUBE}/api/v1/namespaces/${2}/pods/${3}" --header "Authorization: Bearer ${4}" --silent -k > ${POD_FILE}
[ ! $? -eq 0 ] && (echo "{}" && exit 0)

chmod 775 ${POD_FILE}
wcl=$(cat $POD_FILE | wc -l )

if [ $wcl -gt 0 ];then
  kube-linter lint ${POD_FILE} 2>&1 |
    while read -r line
    do
      echo $line | sed  -n 's/^\([^\ ]*\)\ \(([^\(]*)\)\ \(.*\)$/\3/p'
    done | jq -R -s -c 'split("\n")'
    rm -f ${POD_FILE}
else
  echo "{}"
fi