#!/bin/bash

echo "Starting chaos-exec general purpose image for KubeInvaders"

echo "Downloading chaos script from KubeInvaders"
curl -o /tmp/chaos_script $2
echo "Executing chaos script"

$1 $2

