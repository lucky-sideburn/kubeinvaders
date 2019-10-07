#!/bin/sh

ENDPOINT=$(echo "https://${ROUTE_HOST}" | sed "s/\//\\\\\//g")

sed -i "s/___buildEnvironment.called=true/___buildEnvironment.called=true;ENV[\"HIT_CPU_TIME_RATE_LIMIT\"]=\"$hit_cpu_time_rate_limit\";ENV[\"TOKEN\"]=\"$TOKEN\";ENV[\"ENDPOINT\"]=\"$ENDPOINT\/kube\";ENV[\"NAMESPACE\"]=\"$NAMESPACE\"/g" /var/www/html/KubeInvaders_wasm.js

sed -i "s/TOTAL_ENV_SIZE=1024/TOTAL_ENV_SIZE=2048/g" /var/www/html/KubeInvaders_wasm.js
sed -i "s/TOTAL_ENV_SIZE=1024/TOTAL_ENV_SIZE=2048/g" /var/www/html/KubeInvaders_asmjs.js

envsubst '${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT_HTTPS}' < "/etc/nginx/conf.d/KubeInvaders.templ" > "/etc/nginx/conf.d/KubeInvaders.conf"

nginx -g 'daemon off;'
