#!/bin/sh

if [ ! -z $DEVELOPMENT ];
then
  ENDPOINT_JS=$(echo "${ENDPOINT}" | sed "s/\//\\\\\//g")
  envsubst '${ENDPOINT}' < "/etc/nginx/conf.d/KubeInvaders_dev.templ" > "/etc/nginx/conf.d/KubeInvaders.conf"
  sed -i "s/var\ ENV={};/var\ ENV={};ENV[\"TOKEN\"]=\"$TOKEN\";ENV[\"ENDPOINT\"]=\"$ENDPOINT_JS\";ENV[\"NAMESPACE\"]=\"$NAMESPACE\";ENV[\"HITSLIMIT\"]=\"$HITSLIMIT\";ENV[\"ALIENPROXIMITY\"]=\"$ALIENPROXIMITY\";ENV[\"UPDATETIME\"]=\"$UPDATETIME\";/g" /var/www/html/KubeInvaders_wasm.js
else
  envsubst '${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT_HTTPS}' < "/etc/nginx/conf.d/KubeInvaders.templ" > "/etc/nginx/conf.d/KubeInvaders.conf"
  sed -i "s/var\ ENV={};/var\ ENV={};ENV[\"TOKEN\"]=\"$TOKEN\";ENV[\"ENDPOINT\"]=\"$ENDPOINT\/kube\";ENV[\"NAMESPACE\"]=\"$NAMESPACE\";ENV[\"HITSLIMIT\"]=\"$HITSLIMIT\";ENV[\"ALIENPROXIMITY\"]=\"$ALIENPROXIMITY\";ENV[\"UPDATETIME\"]=\"$UPDATETIME\";/g" /var/www/html/KubeInvaders_wasm.js
fi

sed -i "s/TOTAL_ENV_SIZE=1024/TOTAL_ENV_SIZE=2048/g" /var/www/html/KubeInvaders_wasm.js
sed -i "s/TOTAL_ENV_SIZE=1024/TOTAL_ENV_SIZE=2048/g" /var/www/html/KubeInvaders_asmjs.js

nginx -g 'daemon off;'
