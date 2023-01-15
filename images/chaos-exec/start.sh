#!/bin/bash

echo "Starting chaos-exec general purpose image for KubeInvaders"
echo $2 | sed 's/code=//g' | base64 -d > /tmp/run.chaos
echo "Executing chaos script"
cat /tmp/run.chaos
($1 /tmp/run.chaos) || echo "Chaos job completed with error. Please check code of this experiment"

