#Change with the namespace you want to stress
TARGET_NAMESPACE='foobar'

#Change with the URL of your Kubeinvaders 
ROUTE_HOST=kubeinvaders.org

kubectl apply -f kubernetes/kubeinvaders-namespace.yml
kubectl apply -f kubernetes/kubeinvaders-deployment.yml -n kubeinvaders
kubectl expose deployment  kubeinvaders --type=NodePort --name=kubeinvaders -n kubeinvaders --port 8080
kubectl apply -f kubernetes/kubeinvaders-ingress.yml -n kubeinvaders
kubectl create sa kubeinvaders -n foobar 
TOKEN=`kubectl describe secret $(kubectl get secret -n foobar | grep 'kubeinvaders-token' | awk '{ print $1}') -n foobar | grep 'token:' | awk '{ print $2}'`
kubectl apply -f kubernetes/kubeinvaders-role.yml
kubectl set env deployment/kubeinvaders TOKEN=$TOKEN -n kubeinvaders
kubectl set env deployment/kubeinvaders NAMESPACE=$TARGET_NAMESPACE -n kubeinvaders
kubectl set env deployment/kubeinvaders ROUTE_HOST=$ROUTE_HOST -n kubeinvaders
