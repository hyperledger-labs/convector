ROOT_DIR=$(dirname "${BASH_SOURCE[0]}")/..

COMPOSE_PROJECT_NAME=net \
  docker-compose -f $ROOT_DIR/docker-compose.yml down
