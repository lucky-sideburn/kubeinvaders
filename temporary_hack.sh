#!/bin/sh
ENDPOINT=$(echo $ENDPOINT | sed "s/\//\\\\\//g")
sed -i "s/___buildEnvironment.called=true/___buildEnvironment.called=true;ENV[\"TOKEN\"]=\"$TOKEN\";ENV[\"ENDPOINT\"]=\"$ENDPOINT\";ENV[\"NAMESPACE\"]=\"$NAMESPACE\"/g" /var/www/html/KubeInvaders_wasm.js
nginx -g 'daemon off;'
