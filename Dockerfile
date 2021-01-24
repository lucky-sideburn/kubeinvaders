FROM  nginx

# Install kubectl

RUN curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl"
RUN chmod +x ./kubectl
RUN mv ./kubectl /usr/local/bin/kubectl

# Install Openresty
RUN apt-get update
RUN apt-get -y install --no-install-recommends wget gnupg ca-certificates jq openssl task-spooler at
RUN wget -O - https://openresty.org/package/pubkey.gpg | apt-key add -
RUN codename=`grep -Po 'VERSION="[0-9]+ \(\K[^)]+' /etc/os-release` && echo "deb http://openresty.org/package/debian $codename openresty" | tee /etc/apt/sources.list.d/openresty.list
RUN apt-get update
RUN apt-get -y install openresty

# Install kube-linter
RUN curl -L -O https://github.com/stackrox/kube-linter/releases/download/0.1.5/kube-linter-linux.tar.gz
RUN tar -xvf kube-linter-linux.tar.gz
RUN rm -f kube-linter-linux.tar.gz
RUN cp  kube-linter /usr/local/bin/
RUN chmod 775 /usr/local/bin/kube-linter
COPY kube-linter/kube-linter-parser.sh /opt/kube-linter-parser.sh
RUN chmod +x /opt/kube-linter-parser.sh

# Install chaos-node
COPY chaos-node/chaos-node.sh /opt/
RUN chmod +x /opt/chaos-node.sh

# Install KubeInvaders
COPY ./js-web/KubeInvaders /var/www/html

# Configure Nginx
#RUN sed -i.bak 's/^user/#user/' /etc/nginx/nginx.conf
RUN sed -i.bak 's/listen\(.*\)80;/listen 8081;/' /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/metrics.lua /tmp/metrics.lua

COPY nginx/KubeInvaders.templ /etc/nginx/conf.d/KubeInvaders.templ
COPY nginx/KubeInvaders_dev.templ /etc/nginx/conf.d/KubeInvaders_dev.templ

RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx /var/www/html /etc/nginx/conf.d/KubeInvaders.templ /etc/nginx/conf.d


EXPOSE 8080

ENV PATH=/usr/local/openresty/nginx/sbin:$PATH
COPY ./temporary_hack.sh /
RUN chmod a+rwx temporary_hack.sh
ENTRYPOINT ["/temporary_hack.sh"]
