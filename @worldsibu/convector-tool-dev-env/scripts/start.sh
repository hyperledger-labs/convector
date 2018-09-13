#!/bin/bash
ROOT_DIR=$(dirname "${0}")/..

COMPOSE_PROJECT_NAME=net FABRIC_VERSION=x86_64-1.1.0 THIRDPARTY_VERSION=x86_64-0.4.6 \
  docker-compose -f $ROOT_DIR/docker-compose.yml up -d
