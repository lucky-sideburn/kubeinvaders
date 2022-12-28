import time
import nomad

# Create a Nomad client
client = nomad.Nomad()

# Create a batch of jobs to submit to Nomad
jobs = [{
    "Name": "stress-test-job",
    "Type": "batch",
    "Datacenters": ["dc1"],
    "TaskGroups": [{
        "Name": "stress-test-task-group",
        "Tasks": [{
            "Name": "stress-test-task",
            "Driver": "raw_exec",
            "Config": {
                "command": "sleep 10"
            },
            "Resources": {
                "CPU": 500,
                "MemoryMB": 512
            }
        }]
    }]
}]

# Continuously submit the batch of jobs to Nomad
while True:
    for job in jobs:
        client.jobs.create(job)
    time.sleep(1)

