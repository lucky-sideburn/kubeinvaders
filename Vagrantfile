# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure('2') do |config|

  config.vm.network 'forwarded_port', guest: 80, host: 8080, host_ip: '127.0.0.1'
  
  $script = <<-SCRIPT
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

  config.vm.provision 'shell', inline: $script
  
  config.vm.post_up_message = '\n\nEnjoy KubeInvaders!\n\n'
  
  config.vm.define 'kubeinvaders01' do |rke|
    rke.vm.box = 'ubuntu/focal64'
    rke.vm.hostname = 'kubeinvaders01'
    rke.vm.provider :virtualbox do |vb|
      vb.memory = 4096
      vb.cpus = 2
    end
  end
end
