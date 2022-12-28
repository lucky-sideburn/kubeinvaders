import time
import consul

# Connect to the Consul cluster
client = consul.Consul()

# Continuously register and deregister a service
while True:
    # Register the service
    client.agent.service.register(
        "stress-test-service",
        port=8080,
        tags=["stress-test"],
        check=consul.Check().tcp("localhost", 8080, "10s")
    )

    # Deregister the service
    client.agent.service.deregister("stress-test-service")

    time.sleep(1)

