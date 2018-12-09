#!/bin/bash
ROOT_DIR=$(dirname "${0}")/..

COMPOSE_PROJECT_NAME=net FABRIC_VERSION=1.3.0 THIRDPARTY_VERSION=0.4.13 \
  docker-compose -f $ROOT_DIR/docker-compose.yml up -d
