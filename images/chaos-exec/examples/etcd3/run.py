import time
import etcd3

# Connect to the etcd3 cluster
client = etcd3.client()

# Continuously set and delete keys
while True:
    # Set a key
    client.put("/stress-test-key", "stress test value")

    # Delete the key
    client.delete("/stress-test-key")

    time.sleep(1)

