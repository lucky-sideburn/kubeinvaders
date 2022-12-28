import time
import kubernetes

# Create a Kubernetes client
client = kubernetes.client.CoreV1Api()

# Continuously create and delete pods
while True:
    # Create a pod
    pod = kubernetes.client.V1Pod(
        metadata=kubernetes.client.V1ObjectMeta(name="stress-test-pod"),
        spec=kubernetes.client.V1PodSpec(
            containers=[kubernetes.client.V1Container(
                name="stress-test-container",
                image="nginx:latest"
            )]
        )
    )
    client.create_namespaced_pod(namespace="default", body=pod)

    # Delete the pod
    client.delete_namespaced_pod(name="stress-test-pod", namespace="default")

    time.sleep(1)

