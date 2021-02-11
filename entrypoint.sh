#!/bin/sh

redis-server /etc/redis/redis.conf &

nginx -c /etc/nginx/nginx.conf -g 'daemon off;'
