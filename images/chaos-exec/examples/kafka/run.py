import time
import random

from kafka import KafkaProducer

# Set up the Kafka producer
producer = KafkaProducer(bootstrap_servers=['localhost:9092'])

# Set up the topic to send messages to
topic = 'test'

# Set up the number of messages to send
num_messages = 10000

# Set up the payload to send
payload = b'a' * 1000000

# Send the messages
start_time = time.time()
for i in range(num_messages):
    producer.send(topic, payload)
end_time = time.time()

# Calculate the throughput
throughput = num_messages / (end_time - start_time)
print(f'Throughput: {throughput} messages/second')

# Flush and close the producer
producer.flush()
producer.close()
