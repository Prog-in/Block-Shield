#!/bin/bash

set -e

echo "🔧 Subindo a rede Fabric com canal dppchannel..."
cd ../../fabric-samples/test-network
./network.sh down
./network.sh up createChannel -c dppchannel -ca

echo "📦 Copiando o chaincode para pasta padrão..."
rm -rf ../chaincode/dpp
cp -r ../../block-shield/src/chaincode/dpp ../chaincode/dpp

echo "🚀 Instalando o chaincode dpp..."
./network.sh deployCC -ccn dpp -ccp ../chaincode/dpp -ccl javascript -c dppchannel

echo "✅ Deploy concluído com sucesso."