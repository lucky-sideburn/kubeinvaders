# Github Actions

This folder contains the definition of a Github action used to build and push the image into a registry and also to setup a minikube cluster to test the deployment of the helm chart.

## setup
In order to use Github Actions for your repository it's necessary to setup two secrets and two environment variables in your project settings.

1. In Github go into your repository then click `Settings`
2. On left side you can see a section called `Security`
3. Click on `Secrets and variables` -> `Actions`
4. Add the secret `REGISTRY_ROBOT_PASSWORD` (the password used to access to the image registry)
5. Add the secret `REGISTRY_ROBOT_USERNAME` (the username used to access to the image registry)
6. Add the variable `REGISTRY_ADDRESS` (the address of the image registry, could be quay.io or docker.io)
7. Add the variable `REGISTRY_USERNAME` (the username used in the image registry)

Once these variables have been setted it is possible to run the action and see the output

**NOTE**: the action build and push the image with the default tag `latest`