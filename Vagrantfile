# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure('2') do |config|

  $k3s_server = <<-SCRIPT
    sed -i 's/PasswordAuthentication\ no/PasswordAuthentication\ yes/g' /etc/ssh/sshd_config
    systemctl restart sshd
    helm_url=https://get.helm.sh/helm-v3.5.3-linux-amd64.tar.gz
    which k3s || curl -sfL https://get.k3s.io | sh -
    which helm || (curl -o /home/vagrant/$(basename $helm_url) $helm_url -L --silent && \
    tar -xvf helm-v3.5.3-linux-amd64.tar.gz && \
    sudo cp /home/vagrant/linux-amd64/helm /usr/local/bin/ && \
    sudo chmod 775 /usr/local/bin/helm)
    helm list &> /dev/null || sudo chown vagrant:root /etc/rancher/k3s/k3s.yaml
    export KUBECONFIG=/etc/rancher/k3s/k3s.yaml 
    kubectl get pods -l app.kubernetes.io/name=ingress-nginx | grep nginx &> /dev/null
    if [ "$?" -ne 0 ];then
      helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
      helm repo update
      helm install ingress-nginx ingress-nginx/ingress-nginx
    fi
    kubectl get namespaces | grep kubeinvaders || kubectl create namespace kubeinvaders
  SCRIPT

  config.vm.post_up_message = '\n\nEnjoy KubeInvaders!\n\n'
  config.vm.synced_folder ".", "/vagrant", type: "smb"
  
  config.vm.define 'kubeinvaders01' do |k3s|
    k3s.vm.box = 'ubuntu/focal64'
    k3s.vm.hostname = 'kubeinvaders01'
    k3s.vm.provision 'shell', inline: $k3s_server
    k3s.vm.network 'private_network', ip: '192.168.58.99'
    k3s.vm.network 'forwarded_port', guest: 80, host: 8080, host_ip: '127.0.0.1'
    k3s.vm.provider :virtualbox do |vb|
      vb.memory = 4096
      vb.cpus = 2
    end
   #k3s.vm.provision "shell",
   #   run: "always",
   #   inline: "route add default gw 192.168.58.99"
  end

  config.vm.define 'kubeinvaders02' do |k3s|
    k3s.vm.box = 'ubuntu/focal64'
    k3s.vm.hostname = 'kubeinvaders02'
    k3s.vm.network 'private_network', ip: '192.168.58.100'
    k3s.vm.provider :virtualbox do |vb|
      vb.memory = 2048
      vb.cpus = 1
    end
  end

  $openresty = <<-SCRIPT
  cd /vagrant
  docker build . -t kubeinvaders-dev
  docker rm kubeinvaders -f
  docker run -d -v /vagrant/scripts:/usr/local/openresty/nginx/conf/kubeinvaders -p 8080:8080 \
    --restart always --name kubeinvaders --env KUBERNETES_SERVICE_HOST=192.168.58.99 --env KUBERNETES_SERVICE_PORT=8443\
    --env ROUTE_HOST=kubeinvaders.io --env ENDPOINT=kubeinvaders.io \
    --env TOKEN=#{ ENV['KUBEINVADERS_DEV_TOKEN']} --env NAMESPACE="namespace1,namespace2" \
    kubeinvaders-dev
  SCRIPT

  config.vm.define 'openresty' do |nginx|
    nginx.vm.box = 'debian/buster64'
    nginx.vm.hostname = 'ngnix01'
    nginx.vm.network 'private_network', ip: '192.168.58.101'
    nginx.vm.provision 'shell', inline: $openresty
    nginx.vm.provider :virtualbox do |vb|
      vb.memory = 2048
      vb.cpus = 1
    end
  end

end
