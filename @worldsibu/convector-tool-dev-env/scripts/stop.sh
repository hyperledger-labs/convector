#!/bin/bash
ROOT_DIR=$(dirname "${0}")/..

COMPOSE_PROJECT_NAME=net \
  docker-compose -f $ROOT_DIR/docker-compose.yml down
