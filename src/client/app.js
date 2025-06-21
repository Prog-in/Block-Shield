import fabricGateway from '@hyperledger/fabric-gateway';
const { connect, signers } = fabricGateway;
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { createPrivateKey } from 'crypto';
import { resolve, dirname } from 'path';
import { credentials, Client } from '@grpc/grpc-js';

async function main() {
    const filename = fileURLToPath(import.meta.url);
    const clientDir = dirname(filename)

    const org1 = 'peer0.org1.example.com'

    // Caminho da conexão (connection profile)
    const ccpPath = resolve(clientDir, '../config/connection-org1.json');
    const ccp = JSON.parse(readFileSync(ccpPath, 'utf8'));

    const peerEndpoint = ccp.peers[org1].url.replace('grpcs://', '');
    const tlsCACert = ccp.peers[org1].tlsCACerts.pem;
    const grpcOptions = ccp.peers[org1].grpcOptions;

    // Carregar certificado TLS do peer
    const tlsRootCert = Buffer.from(tlsCACert).toString();
    const tlsCredentials = credentials.createSsl(Buffer.from(tlsRootCert));

    // Caminhos dos arquivos da identidade
    const mspId = 'Org1MSP';
    const certPath = resolve(clientDir, 'wallet/appUser/cert.pem');
    const keyPath = resolve(clientDir, 'wallet/appUser/key.pem');

    const identity = {
        mspId,
        credentials: readFileSync(certPath),
    };

    const privateKeyPem = readFileSync(keyPath, 'utf8');
    const privateKey = createPrivateKey(privateKeyPem);
    const signer = signers.newPrivateKeySigner(privateKey);

    const client = new Client(peerEndpoint, tlsCredentials, grpcOptions);

    const connection = connect({identity, signer, client});

    const network = connection.getNetwork('dppchannel');
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