kubernetes-version?=v1.26.3
driver?=virtualbox
memory?=2048
cpu?=4
nodes?=1
image_tag?=latest

MAKEFILE_DIRECTORY:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

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
	kubectl apply -f ${MAKEFILE_DIRECTORY}/manifests \
		&& helm upgrade --install kubeinvaders \
			--set-string config.target_namespace="ns-1" \
			-n kubeinvaders \
			kubeinvaders/kubeinvaders \
			--set ingress.enabled=true \
			--set ingress.hostName=kubeinvaders.local \
			--set deployment.image.tag=$(image_tag) \
		&& minikube addons enable ingress

.PHONY: dev-cluster
dev-cluster:
	kubectl apply -f ${MAKEFILE_DIRECTORY}/manifests \
		&& helm upgrade --install kubeinvaders \
			--set-string config.target_namespace="ns-1" \
			-n kubeinvaders \
			${MAKEFILE_DIRECTORY}/../helm-charts/kubeinvaders \
			--set ingress.enabled=true \
			--set ingress.hostName=kubeinvaders.local \
			--set deployment.image.tag=$(image_tag) \
		&& minikube addons enable ingress

.PHONY: develop
develop: init-cluster dev-cluster

.PHONY: setup
setup: init-cluster setup-cluster

.PHONY: delete-cluster
delete-cluster: 
	minikube delete





