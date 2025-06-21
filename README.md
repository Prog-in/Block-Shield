# Block Shield – Passaporte Digital de Produto (DPP) com Hyperledger Fabric

Block Shield é um projeto que implementa uma rede Hyperledger Fabric para registro e consulta de passaportes digitais de produtos (DPPs). A proposta está alinhada com iniciativas de sustentabilidade e rastreabilidade reguladas pela União Europeia.

O sistema permite registrar informações sobre a origem do produto, certificações, pegada de carbono e eventos de ciclo de vida como manutenção e reciclagem.

## 🧱 Estrutura

src/  
├── chaincode/          → Smart contract (DigitalProductPassport.js)  
├── client/             → Cliente Node.js para registrar DPPs  
├── config/             → Conexão com a rede (connection-org1.json)  
├── network/            → (Opcional) Serviços extras via Docker Compose  
└── scripts/            → Script para automatizar o deploy  

## 🚀 Como executar

Pré-requisitos:

- Docker e Docker Compose  
- Node.js
- Git
- Go

Na raiz do projeto, siga o seguinte passo-a-passo:

1. Instale o HyperLedger Fabric Samples

```bash
curl -sSL https://bit.ly/2ysbOFE | bash -s
```

2. Execute o script de deploy

```bash
cd src/scripts
chmod +x deploy.sh
./deploy.sh
```
