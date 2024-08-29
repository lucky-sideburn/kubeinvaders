function build() {
    journalctl --vacuum-size=1M
    rm -rf /var/lib/containers/storage/*
    rm -rf /run/containers/storage/*
    podman system reset -f
    /bin/cp Dockerfile_full Dockerfile
    podman build /usr/local/src/kubeinvaders -t 10.10.10.3:5000/local/kubeinvaders:develop
    for i in $(podman  ps -a | grep -v CONTAINER | awk '{ print $1}'); do podman rm $i -f ; done
    podman tag 10.10.10.3:5000/local/kubeinvaders:develop 10.10.10.3:5000/local/kubeinvaders_base:develop
    podman  push 10.10.10.3:5000/local/kubeinvaders_base:develop
}

function build_redux() {
    journalctl --vacuum-size=1M
    /bin/cp Dockerfile_redux Dockerfile
    for i in $(podman  ps -a | grep -v CONTAINER | awk '{ print $1}'); do podman rm $i -f ; done
    podman build /usr/local/src/kubeinvaders -t 10.10.10.3:5000/local/kubeinvaders:develop
}

function run(){
    podman run -p 8080:8080 \
    --env K8S_TOKEN=eyJhbGciOiJSUzI1NiIsImtpZCI6ImlrbVNQMWg5QUVCLVhjQl9uT0V4aVpQY0RNdTR2aVVHTzdJeXBZSXNnZkkifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlaW52YWRlcnMiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlY3JldC5uYW1lIjoia3ViZWludmFkZXJzLXRva2VuLWo1Y3hzIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6Imt1YmVpbnZhZGVycyIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6ImYxOTViODI4LWRhZTYtNGM1ZC05YzliLTVlOGQwYTI0NTEzZiIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlaW52YWRlcnM6a3ViZWludmFkZXJzIn0.NqVdsSw3cs3jMevheokUNPfb9WmlQe7g6CrAytcApq9Z9FFFomXib5kb1fgdKYVJn4vb0a6H3kHB8hKJo0UcPu24wVCAYwxsfCTuK13tsCJxrycs2TxyoTWsXALMbBMgDJthCal14RwikWFpW4EyHryqkEAAn-U5goBdaabCSHhWCiR4ulbmuKy8xep8yppRw66505hq4Rdc6gMcj4_bgTDLKSh_g1lySHdHiiTo1v5X71_BD5QEKIEj2Ak4mslpAy-aQUOso4HicIIvd7I1NLDfis1Scj9IjhL8jdRXrOSk9KUbFBJCOMCye2pSYK3eqRDsjVe7BKPZB53WtMW7ew \
    --env ENDPOINT=localhost:8080 \
    --env KUBERNETES_SERVICE_HOST=10.10.10.4 \
    --env KUBERNETES_SERVICE_PORT_HTTPS=6443 \
    --env INSECURE_ENDPOINT=true \
    --env NAMESPACE=namespace1,namespace2 \
    10.10.10.3:5000/local/kubeinvaders:develop
}

if [ "$1" == "build" ]; then
    build
elif [ "$1" == "run" ]; then
    run
elif [ "$1" == "all" ]; then
    build
    run
elif [ "$1" == "allredux" ]; then
   build_redux
   run   
else
    echo "Usage: $0 [build|run]"
fi

