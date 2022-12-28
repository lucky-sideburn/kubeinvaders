import time
import random
import psycopg2

# Set up the connection parameters
params = {
    'host': 'localhost',
    'port': '5432',
    'database': 'test',
    'user': 'postgres',
    'password': 'password'
}

# Connect to the database
conn = psycopg2.connect(**params)

# Set up the cursor
cur = conn.cursor()

# Set up the table and payload to insert
table_name = 'test'
payload = 'a' * 1000000

# Set up the number of rows to insert
num_rows = 10000

# Insert the rows
start_time = time.time()
for i in range(num_rows):
    cur.execute(f"INSERT INTO {table_name} (col) VALUES ('{payload}')")
conn.commit()
end_time = time.time()

# Calculate the throughput
throughput = num_rows / (end_time - start_time)
print(f'Throughput: {throughput} rows/second')

# Close the cursor and connection
cur.close()
conn.close()

