#!/bin/bash
ROOT_DIR=$(dirname "${0}")/..
USERS=3
CONVECTOR_DIR="${CONVECTOR_DIR:-$PWD/.convector-dev-env}"
CONVECTOR_CONFIG="${CONVECTOR_CONFIG:-$CONVECTOR_DIR/examples}"

rm -rf $CONVECTOR_DIR
mkdir -p $CONVECTOR_DIR
cp -r $ROOT_DIR/network-objects $CONVECTOR_DIR/
cp -r $ROOT_DIR/examples $CONVECTOR_DIR/

function createchannel() {
  for CH in ${@:2}
  do
    echo "Creating $CH channel block in peer $1"
    docker exec $1 peer channel create \
      -o orderer.example.com:7050 \
      -c $CH \
      -f /etc/hyperledger/configtx/$CH.tx

    docker exec $1 mv $CH.block /shared/
  done
}

function joinchannel() {
  for CH in ${@:2}
  do
    echo "Joining $CH channel on peer $1"
    docker exec $1 peer channel join -b /shared/$CH.block
  done
}

function setanchor() {
  for CH in ${@:2}
  do
    echo "Creating $CH anchor block in peer $1"
    docker exec $1 peer channel update \
      -o orderer.example.com:7050 \
      -c $CH \
      -f /etc/hyperledger/configtx/$1.$CH.tx
  done
}

function registeradmin() {
  node $ROOT_DIR/dist/command.js add-admin \
    admin adminpw $2 \
      -k "$CONVECTOR_DIR/.hfc-$1" \
      -p "$CONVECTOR_CONFIG/$1.network-profile.yaml"
}

function registeruser() {
  node $ROOT_DIR/dist/command.js add-user \
    $1 admin $4 \
      -a $2.$3 \
      -r client \
      -k "$CONVECTOR_DIR/.hfc-$2" \
      -p "$CONVECTOR_CONFIG/$2.network-profile.yaml"
}

createchannel peer0.org1.example.com ch1 ch2

sleep 5

joinchannel peer0.org1.example.com ch1 ch2
joinchannel peer0.org2.example.com ch1 ch2

setanchor peer0.org1.example.com ch1 ch2
setanchor peer0.org2.example.com ch1 ch2

sleep 5

echo "Register admin for org1"
registeradmin org1 Org1MSP
echo "Register admin for org2"
registeradmin org2 Org2MSP

for i in $(seq 1 $USERS)
do
  echo "Register user$i for org1"
  registeruser user$i org1 department1 Org1MSP
  sleep 2

  echo "Register user$i for org2"
  registeruser user$i org2 department1 Org2MSP
  sleep 2
done
