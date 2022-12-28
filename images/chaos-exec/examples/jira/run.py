import time
from jira import JIRA

# Connect to the Jira instance
jira = JIRA(
    server="https://jira.example.com",
    basic_auth=("user", "password")
)

# Continuously create and delete issues
while True:
    # Create an issue
    issue = jira.create_issue(
        project="PROJECT",
        summary="Stress test issue",
        description="This is a stress test issue.",
        issuetype={"name": "Bug"}
    )

    # Delete the issue
    jira.delete_issue(issue)

    time.sleep(1)

