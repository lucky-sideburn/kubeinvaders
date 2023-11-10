kubernetes-version?=v1.26.3
driver?=virtualbox
memory?=2048
cpu?=4
nodes?=1


.PHONY: init-cluster
init-cluster:
	minikube start \
        --kubernetes-version $(kubernetes-version) \
        --driver $(driver) \
        --memory $(memory) \
        --cpus $(cpu) \
        --nodes $(nodes) \
        --embed-certs  \
		--static-ip 10.211.55.70


.PHONY: setup-cluster
setup-cluster: 
	kubectl apply -f manifests && helm install kubeinvaders --set-string config.target_namespace="namespace1,namespace2" \
	-n kubeinvaders kubeinvaders/kubeinvaders --set ingress.enabled=true --set ingress.hostName=kubeinvaders.local --set deployment.image.tag=v1.9.6 && minikube addons enable ingress


.PHONY: setup
setup: init-cluster setup-cluster

.PHONY: delete-cluster
delete-cluster: 
	minikube delete





