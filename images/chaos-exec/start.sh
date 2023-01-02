#!/bin/bash

echo "Starting chaos-exec general purpose image for KubeInvaders"

echo "Downloading chaos script from KubeInvaders"
curl -o /tmp/run.chaos $2
echo "Executing chaos script"

($1 /tmp/run.chaos) || echo "Chaos job completed with error. Please check code of this experiment"

