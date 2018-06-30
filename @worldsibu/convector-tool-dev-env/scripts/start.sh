ROOT_DIR=$(dirname "${BASH_SOURCE[0]}")/..

COMPOSE_PROJECT_NAME=net FABRIC_VERSION=x86_64-1.1.0 THIRDPARTY_VERSION=x86_64-0.4.6 \
  docker-compose -f $ROOT_DIR/docker-compose.yml up -d

docker exec peer0.org1.example.com peer channel create \
  -o orderer.example.com:7050 -c mychannel -f /etc/hyperledger/configtx/channel.tx

docker exec peer0.org1.example.com peer channel join -b mychannel.block

node $ROOT_DIR/scripts/registerAdmin.js
node $ROOT_DIR/scripts/registerUser.js
