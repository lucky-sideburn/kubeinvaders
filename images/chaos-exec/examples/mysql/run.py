import time
import mysql.connector

# Connect to the MySQL database
cnx = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="test"
)
cursor = cnx.cursor()

# Continuously insert rows into the "test_table" table
while True:
    cursor.execute("INSERT INTO test_table (col1, col2) VALUES (%s, %s)", (1, 2))
    cnx.commit()
    time.sleep(1)

# Close the database connection
cnx.close()

