#!/bin/bash
ROOT_DIR=$(dirname "${0}")/..
BIN=$ROOT_DIR/bin
CONFIG=$ROOT_DIR/config
NETWORK_OBJECTS=$ROOT_DIR/network-objects

export FABRIC_CFG_PATH=$CONFIG

function fail () {
  if [ "$?" -ne 0 ]; then
    echo $1
    exit 1
  fi
}

# remove previous crypto material and config transactions
rm -fr $NETWORK_OBJECTS/config/*
rm -fr $NETWORK_OBJECTS/crypto-config/*

# generate crypto material
$BIN/cryptogen generate --config=$CONFIG/crypto-config.yaml --output=$NETWORK_OBJECTS/crypto-config
fail "Failed to generate crypto material..."

# generate genesis block for orderer
$BIN/configtxgen -profile TwoOrgOrdererGenesis -outputBlock $NETWORK_OBJECTS/config/genesis.block
fail "Failed to generate orderer genesis block..."

for CH in ch1 ch2
do
  # generate channel configuration transaction
  $BIN/configtxgen -profile TwoOrgChannel -outputCreateChannelTx $NETWORK_OBJECTS/config/$CH.tx -channelID $CH
  fail "Failed to generate $CH configuration transaction..."

  # generate anchor peer transaction for Org1
  $BIN/configtxgen -profile TwoOrgChannel -outputAnchorPeersUpdate $NETWORK_OBJECTS/config/peer0.org1.example.com.$CH.tx -channelID $CH -asOrg Org1MSP
  fail "Failed to generate $CH anchor peer update for Org1MSP..."

  # generate anchor peer transaction for Org2
  $BIN/configtxgen -profile TwoOrgChannel -outputAnchorPeersUpdate $NETWORK_OBJECTS/config/peer0.org2.example.com.$CH.tx -channelID $CH -asOrg Org2MSP
  fail "Failed to generate $CH anchor peer update for Org2MSP..."
done
