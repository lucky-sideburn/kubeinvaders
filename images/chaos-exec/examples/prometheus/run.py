import time
import random
from prometheus_client import CollectorRegistry, Gauge, push_to_gateway

# Set up the metrics registry
registry = CollectorRegistry()

# Set up the metric to push
gauge = Gauge('test_gauge', 'A test gauge', registry=registry)

# Set up the push gateway URL
push_gateway = 'http://localhost:9091'

# Set up the number of pushes to send
num_pushes = 10000

# Set up the metric value to push
value = random.random()

# Push the metric
start_time = time.time()
for i in range(num_pushes):
    gauge.set(value)
    push_to_gateway(push_gateway, job='test_job', registry=registry)
end_time = time.time()

# Calculate the throughput
throughput = num_pushes / (end_time - start_time)
print(f'Throughput: {throughput} pushes/second')

