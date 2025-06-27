# Block Shield – Digital Product Passport (DPP) with Hyperledger Fabric

Block Shield is a project that implements a Hyperledger Fabric network for the registration and querying of digital product passports (DPPs). The proposal is aligned with sustainability and traceability initiatives regulated by the European Union.

The system allows the registration of information such as product origin, certifications, carbon footprint, and lifecycle events such as maintenance and recycling.

## Structure

```
src/  
├── chaincode/dpp/      → Smart contract (DigitalProductPassport.js) 
├── client/             → Node.js client for registering DPPs 
├── config/             → Network connection (connection-org1.json) 
└── scripts/            → Script to automate deployment 
```

## How to run

Prerequisites:

- Docker and Docker Compose  
- Node.js
- Git
- Go

In the root directory of the project, follow these steps:

1. Install Hyperledger Fabric Samples

```bash
curl -sSL https://bit.ly/2ysbOFE | bash -s
```

2. Run the deployment script

```bash
cd src/scripts
chmod +x deploy.sh
./deploy.sh
```

3. Install the Node.js dependencies and run the demonstration

```bash
cd ../client
npm install
npm start
```
