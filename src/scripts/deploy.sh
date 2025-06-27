#!/bin/bash
. constants.env

set -e

cd $TEST_NETWORK

echo "Shutting down possible previous Fabric network..."
./network.sh down

echo "Creating Fabric network with channel dppchannel..."
./network.sh up createChannel -c dppchannel -ca

echo "Copying the chaincode dpp to the default directory..."
rm -rf ../chaincode && mkdir ../chaincode && cp -r ../../src/chaincode/dpp ../chaincode/dpp

echo "Instaling the chaincode dpp..."
./network.sh deployCC -ccn dpp -ccp ../chaincode/dpp -ccl javascript -c dppchannel

cp $ORG1/connection-org1.json $CONFIG/connection-org1.json

cd $SCRIPTS

rm -rf $CLIENT/wallet

echo "Registering admin"
./register-admin.sh

echo "Registering user"
./register-user.sh

echo "✅ Deploy successfully completed."
