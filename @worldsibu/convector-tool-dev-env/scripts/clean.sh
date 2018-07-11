#!/bin/sh
docker rm -f $(docker ps -a | awk '$2~/hyperledger/ {print $1}') $(docker ps -a | awk '{ print $1,$2 }' | grep dev-peer | awk '{print $1 }') || true
docker rmi -f $(docker images | grep dev-peer | awk '{print $3}') || true

rm -rf $PWD/.hfc-*
