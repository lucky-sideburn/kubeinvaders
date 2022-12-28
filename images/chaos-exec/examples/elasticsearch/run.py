import time
from elasticsearch import Elasticsearch

# Connect to the Elasticsearch cluster
es = Elasticsearch(["localhost"])

# Continuously index and delete documents
while True:
    # Index a document
    es.index(index="test-index", doc_type="test-type", id=1, body={"test": "test"})

    # Delete the document
    es.delete(index="test-index", doc_type="test-type", id=1)

    time.sleep(1)

