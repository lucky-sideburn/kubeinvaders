FROM docker.io/openresty/openresty:bookworm-fat
# Update repo and install some utilities and prerequisites
RUN apt-get update -y
RUN apt-get -y install wget at procps gnupg ca-certificates jq openssl task-spooler apt-transport-https python3 python3-pip redis libssl-dev  python3-yaml python3-kubernetes python3-redis python3-requests

# Install kubectl
RUN ARCH=$(dpkg --print-architecture) && \
    curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/${ARCH}/kubectl"
RUN chmod +x ./kubectl
RUN mv ./kubectl /usr/local/bin/kubectl

# # Install Openresty
# RUN curl -fsSL https://openresty.org/package/pubkey.gpg | gpg --dearmor -o /usr/share/keyrings/openresty.gpg \
#     && echo "deb [signed-by=/usr/share/keyrings/openresty.gpg] http://openresty.org/package/debian $(. /etc/os-release && echo "$VERSION_CODENAME") openresty" \
#     > /etc/apt/sources.list.d/openresty.list

# RUN apt-get update -y
# RUN apt-get -y install openresty
# RUN chmod 777 /usr/local/openresty/nginx

# Install LUA Module
RUN apt-get -y install luarocks lua-json lua-socket libyaml-dev
RUN apt-get update --fix-missing

RUN for pkg in luasec lunajson lua-resty-http lyaml lua-resty-openssl; do luarocks install $pkg; done

# Install kube-linter
RUN curl -L -O https://github.com/stackrox/kube-linter/releases/download/0.6.0/kube-linter-linux.tar.gz
RUN tar -xvf kube-linter-linux.tar.gz && rm -f kube-linter-linux.tar.gz
RUN cp kube-linter /usr/local/bin/ && chmod 775 /usr/local/bin/kube-linter
RUN mkdir /tmp/kube-linter-pods && chmod 777 /tmp/kube-linter-pods

# Installl parser script for kubelinter
COPY kube-linter/kube-linter-parser.sh /opt/kube-linter-parser.sh
RUN chmod +x /opt/kube-linter-parser.sh

# Install KubeInvaders (html and js)
COPY html/ /var/www/html

# Configure Redis
COPY confs/redis/redis.conf /etc/redis/redis.conf

# Configure Nginx and KubeInvaders conf
RUN sed -i.bak 's/listen\(.*\)80;/listen 8081;/' /etc/nginx/conf.d/default.conf
RUN mkdir -p /usr/local/openresty/nginx/conf/kubeinvaders/data
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/KubeInvaders.conf /etc/nginx/conf.d/KubeInvaders.conf
RUN chmod g+rwx /var/run /etc/nginx/conf.d
RUN chmod 777 /var/www/html

# Copy LUA scripts
COPY scripts/metrics.lua /usr/local/openresty/nginx/conf/kubeinvaders/metrics.lua
COPY scripts/pod.lua /usr/local/openresty/nginx/conf/kubeinvaders/pod.lua
COPY scripts/ingress.lua /usr/local/openresty/nginx/conf/kubeinvaders/ingress.lua
COPY scripts/vm.lua /usr/local/openresty/nginx/conf/kubeinvaders/vm.lua
COPY scripts/vm_reboot.lua /usr/local/openresty/nginx/conf/kubeinvaders/vm_reboot.lua
COPY scripts/node.lua /usr/local/openresty/nginx/conf/kubeinvaders/node.lua
COPY scripts/kube-linter.lua /usr/local/openresty/nginx/conf/kubeinvaders/kube-linter.lua
COPY scripts/chaos-node.lua /usr/local/openresty/nginx/conf/kubeinvaders/chaos-node.lua
COPY scripts/chaos-containers.lua /usr/local/openresty/nginx/conf/kubeinvaders/chaos-containers.lua
COPY scripts/programming_mode.lua /usr/local/openresty/nginx/conf/kubeinvaders/programming_mode.lua
COPY scripts/config_kubeinv.lua /usr/local/openresty/lualib/config_kubeinv.lua
COPY scripts/data/codenames.txt /usr/local/openresty/nginx/conf/kubeinvaders/data/codenames.txt
COPY scripts/demo_deploy.lua /usr/local/openresty/nginx/conf/kubeinvaders/demo_deploy.lua

# Copy Python helpers
COPY scripts/programming_mode /opt/programming_mode/
COPY scripts/metrics_loop /opt/metrics_loop/
COPY scripts/logs_loop /opt/logs_loop/

# Embedded KWOK demo cluster (see docs/kwok.md). Build with --build-arg WITH_KWOK=false for a slim image.
# etcd and kube-* binaries (~400 MB) are downloaded here so the container starts offline.
ARG WITH_KWOK=true
ARG KWOK_VERSION=v0.8.0
ARG KUBE_VERSION=v1.36.1
ARG ETCD_VERSION=v3.6.10
RUN if [ "$WITH_KWOK" = "true" ]; then \
      set -e; \
      ARCH=$(dpkg --print-architecture); \
      mkdir -p /opt/kwok/bin; \
      fetch() { echo "[kwok] Downloading $2"; curl -fsSL --retry 3 -o "$1" "$2"; }; \
      fetch /usr/local/bin/kwokctl "https://github.com/kubernetes-sigs/kwok/releases/download/${KWOK_VERSION}/kwokctl-linux-${ARCH}"; \
      fetch /opt/kwok/bin/kwok "https://github.com/kubernetes-sigs/kwok/releases/download/${KWOK_VERSION}/kwok-linux-${ARCH}"; \
      for c in kube-apiserver kube-controller-manager kube-scheduler; do \
        fetch "/opt/kwok/bin/$c" "https://dl.k8s.io/release/${KUBE_VERSION}/bin/linux/${ARCH}/$c"; \
      done; \
      fetch /tmp/etcd.tar.gz "https://github.com/etcd-io/etcd/releases/download/${ETCD_VERSION}/etcd-${ETCD_VERSION}-linux-${ARCH}.tar.gz"; \
      tar -xzf /tmp/etcd.tar.gz -C /opt/kwok/bin --strip-components=1 "etcd-${ETCD_VERSION}-linux-${ARCH}/etcd"; \
      rm -f /tmp/etcd.tar.gz; \
      chmod +x /usr/local/bin/kwokctl /opt/kwok/bin/*; \
      echo "[kwok] Binaries installed in /opt/kwok/bin"; \
    fi
COPY kwok/manifests/ /opt/kwok/manifests/
COPY kwok/start-kwok.sh /opt/kwok/start-kwok.sh
RUN chmod a+rx /opt/kwok/start-kwok.sh

EXPOSE 8080

ENV PATH=/usr/local/openresty/nginx/sbin:$PATH

COPY ./entrypoint.sh /

RUN chmod a+rwx ./entrypoint.sh

RUN apt clean && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/entrypoint.sh"]
