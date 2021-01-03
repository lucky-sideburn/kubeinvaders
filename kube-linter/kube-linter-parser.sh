#!/bin/sh

POD_FILE=/tmp/${3}.yaml

curl -XGET "${1}/api/v1/namespaces/${2}/pods/${3}" --header "Authorization: Bearer ${4}" --silent -k > ${POD_FILE}
[ ! $? -eq 0 ] && (echo "{}" && exit 0)

chmod 775 ${POD_FILE}
wcl=$(cat $POD_FILE | wc -l )

if [ $wcl -gt 0 ];then
  kube-linter lint ${POD_FILE} 2>&1 |
    while read -r line
    do
      echo $line | sed  -n 's/^\([^\ ]*\)\ \(([^\(]*)\)\ \(.*\)$/\3/p'
    done | jq -R -s -c 'split("\n")'
else
  echo "{}"
fi


