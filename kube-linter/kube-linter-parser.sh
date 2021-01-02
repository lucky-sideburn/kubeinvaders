#!/bin/sh

kube-linter lint $1 2>&1 |
while read -r line
do
   echo
   echo $line  |sed  -n 's/^\([^\ ]*\)\ \(([^\(]*)\)\ \(.*\)$/\3/p'
   echo
done
