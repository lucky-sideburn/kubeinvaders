#!/bin/sh

# Source the service account token from the container directly.
export TOKEN="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)"

redis-server /etc/redis/redis.conf &

sed -i "s/ENDPOINT_PLACEHOLDER/$ENDPOINT/g" /var/www/html/kubeinvaders.js

nginx -c /etc/nginx/nginx.conf -g 'daemon off;'
