const { connect, signers, Identity, signers: { createSignerFromKeyFiles } } = require('@hyperledger/fabric-gateway');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const grpc = require('@grpc/grpc-js');

async function main() {
    // Caminho da conexão (connection profile)
    const ccpPath = path.resolve(__dirname, '../config/connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const peerEndpoint = ccp.peers['peer0.org1.example.com'].url; // geralmente grpcs://localhost:7051
    const tlsCACert = ccp.peers['peer0.org1.example.com'].tlsCACerts.pem;

    // Carregar certificado TLS do peer
    const tlsRootCert = Buffer.from(tlsCACert).toString();
    const tlsCredentials = grpc.credentials.createSsl(Buffer.from(tlsRootCert));

    // Caminhos dos arquivos da identidade
    const mspId = 'Org1MSP';
    const certPath = path.resolve(__dirname, 'wallet/cert.pem');
    const keyPath = path.resolve(__dirname, 'wallet/key.pem');

    const identity = {
        mspId,
        credentials: fs.readFileSync(certPath),
    };

    const signer = await signers.createSignerFromKeyFiles(keyPath);

    const client = await connect({
        identity,
        signer,
        connection: {
            address: 'localhost:7051', // ou extraído de peerEndpoint
            credentials: tlsCredentials,
            serverHostOverride: 'peer0.org1.example.com'
        }
    });

    const network = await client.getNetwork('dppchannel');
    const contract = network.getContract('dpp');

    const result = await contract.submitTransaction(
        'registerDPP',
        'DPP-001',
        'MFG-001',
        'EcoLight',
        '2025-01-01',
        '4.3',
        JSON.stringify(['CE', 'RoHS'])
    );

    console.log(`✅ Transação concluída: ${result.toString()}`);
    client.close();
}

main().catch(console.error);