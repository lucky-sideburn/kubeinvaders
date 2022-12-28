import time
import random
from pymongo import MongoClient

# Set up the MongoDB client
client = MongoClient('mongodb://localhost:27017/')

# Set up the database and collection to use
db = client['test']
collection = db['test']

# Set up the number of documents to insert
num_documents = 10000

# Set up the payload to insert
payload = {'key': 'a' * 1000000}

# Insert the documents
start_time = time.time()
for i in range(num_documents):
    collection.insert_one(payload)
end_time = time.time()

# Calculate the throughput
throughput = num_documents / (end_time - start_time)
print(f'Throughput: {throughput} documents/second')

# Close the client
client.close()

