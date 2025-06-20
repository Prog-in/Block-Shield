#!/bin/bash
. constants.env

set -e

cd $FABRIC_SAMPLES/test-network

echo "Encerrando possível rede Fabric anterior..."
./network.sh down

echo "Subindo a rede Fabric com canal dppchannel..."
./network.sh up createChannel -c dppchannel -ca

echo "Copiando o chaincode para pasta padrão..."
rm -rf ../chaincode && mkdir ../chaincode && cp -r ../../src/chaincode/dpp ../chaincode/dpp

echo "Instalando o chaincode dpp..."
./network.sh deployCC -ccn dpp -ccp ../chaincode/dpp -ccl javascript -c dppchannel

cd $SCRIPTS

echo "Registrando admin"
./register-admin.sh

echo "Registrando usuário"
./register-user.sh

echo "✅ Deploy concluído com sucesso."
