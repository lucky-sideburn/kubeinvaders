FROM nginx:stable

# Update repo and install some utilities and prerequisites
RUN apt-get update -y
RUN apt-get -y install procps git vim wget gnupg ca-certificates jq openssl task-spooler at curl apt-transport-https python3 python3-pip redis libssl-dev
RUN pip3 install pyyaml
# --no-install-recommends

# Install kubectl
RUN curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"
RUN chmod +x ./kubectl
RUN mv ./kubectl /usr/local/bin/kubectl

# Install Openresty
RUN wget -O - https://openresty.org/package/pubkey.gpg | apt-key add -
RUN codename=`grep -Po 'VERSION="[0-9]+ \(\K[^)]+' /etc/os-release` && echo "deb http://openresty.org/package/debian $codename openresty" | tee /etc/apt/sources.list.d/openresty.list
RUN apt-get update -y
RUN apt-get -y install openresty
RUN chmod 777 /usr/local/openresty/nginx

# Install LUA Module
RUN apt-get -y install luarocks lua-json lua-socket libyaml-dev
RUN apt-get update --fix-missing
RUN luarocks install luasec
RUN luarocks install lunajson
RUN luarocks install lyaml

# Install kube-linter
RUN curl -L -O https://github.com/stackrox/kube-linter/releases/download/0.6.0/kube-linter-linux.tar.gz
RUN tar -xvf kube-linter-linux.tar.gz && rm -f kube-linter-linux.tar.gz
RUN cp kube-linter /usr/local/bin/ && chmod 775 /usr/local/bin/kube-linter
RUN mkdir /tmp/kube-linter-pods && chmod 777 /tmp/kube-linter-pods

# Installl parser script for kubelinter
COPY kube-linter/kube-linter-parser.sh /opt/kube-linter-parser.sh
RUN chmod +x /opt/kube-linter-parser.sh

# Install KubeInvaders (html and js)
COPY html5/ /var/www/html

# Configure Redis
COPY confs/redis/redis.conf /etc/redis/redis.conf

# Configure Nginx and KubeInvaders conf
RUN sed -i.bak 's/listen\(.*\)80;/listen 8081;/' /etc/nginx/conf.d/default.conf
RUN mkdir -p /usr/local/openresty/nginx/conf/kubeinvaders/data
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/KubeInvaders.conf /etc/nginx/conf.d/KubeInvaders.conf
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx /etc/nginx/conf.d
RUN chmod 777 /var/www/html

# Copy LUA scripts
COPY scripts/metrics.lua /usr/local/openresty/nginx/conf/kubeinvaders/metrics.lua
COPY scripts/pod.lua /usr/local/openresty/nginx/conf/kubeinvaders/pod.lua
COPY scripts/node.lua /usr/local/openresty/nginx/conf/kubeinvaders/node.lua
COPY scripts/kube-linter.lua /usr/local/openresty/nginx/conf/kubeinvaders/kube-linter.lua
COPY scripts/chaos-node.lua /usr/local/openresty/nginx/conf/kubeinvaders/chaos-node.lua
COPY scripts/chaos-containers.lua /usr/local/openresty/nginx/conf/kubeinvaders/chaos-containers.lua
COPY scripts/programming_mode.lua /usr/local/openresty/nginx/conf/kubeinvaders/programming_mode.lua
COPY scripts/config_kubeinv.lua /usr/local/openresty/lualib/config_kubeinv.lua
COPY scripts/data/codenames.txt /usr/local/openresty/nginx/conf/kubeinvaders/data/codenames.txt

# Copy Python helpers
COPY scripts/programming_mode /opt/programming_mode/
COPY scripts/metrics_loop /opt/metrics_loop/
COPY scripts/logs_loop /opt/logs_loop/
RUN pip3 install -r /opt/programming_mode/requirements.txt

EXPOSE 8080

ENV PATH=/usr/local/openresty/nginx/sbin:$PATH

COPY ./entrypoint.sh /

RUN chmod a+rwx ./entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
