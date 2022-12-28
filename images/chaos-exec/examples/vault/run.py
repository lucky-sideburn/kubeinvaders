import time
import hvac

# Connect to the Vault instance
client = hvac.Client()
client.auth_approle(approle_id="approle-id", secret_id="secret-id")

# Continuously read and write secrets
while True:
    # Write a secret
    client.write("secret/stress-test", value="secret value")

    # Read the secret
    client.read("secret/stress-test")

    time.sleep(1)

