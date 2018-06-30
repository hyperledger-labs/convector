docker rm -f $(docker ps -a | awk '$2~/hyperledger/ {print $1}') $(docker ps -a | awk '{print $15}' | grep \"^dev-peer\") || true
docker rmi -f $(docker images | grep \"^dev-peer\" | awk '{print $3}') || true

rm -rf $PWD/.hfc-key-store
