import time
import requests

# Set up the URL to send requests to
url = 'http://localhost:8080/'

# Set up the number of requests to send
num_requests = 10000

# Set up the payload to send
payload = {'key': 'value'}

# Send the requests
start_time = time.time()
for i in range(num_requests):
    requests.post(url, json=payload)
end_time = time.time()

# Calculate the throughput
throughput = num_requests / (end_time - start_time)
print(f'Throughput: {throughput} requests/second')

