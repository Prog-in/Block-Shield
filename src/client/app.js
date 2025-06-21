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

    const peer = ccp.peers[org1];
    const peerEndpoint = peer.url.replace('grpcs://', '');
    const tlsCACert = peer.tlsCACerts.pem;
    const grpcOptions = peer.grpcOptions;

    // Carregar certificado TLS do peer
    const tlsRootCert = Buffer.from(tlsCACert);
    const tlsCredentials = credentials.createSsl(tlsRootCert);

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

    const client = new Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': grpcOptions['ssl-target-name-override'],
        'grpc.default_authority':grpcOptions['hostnameOverride']
    });

    const connection = connect({client, identity, signer});

    const network = connection.getNetwork('dppchannel');
    const contract = network.getContract('dpp');

    const result = await contract.submitTransaction(
        'registerDPP',
        'DPP-008',
        'MFG-001',
        'EcoLight',
        '2025-01-01',
        '4.3',
        JSON.stringify(['CE', 'RoHS'])
    );

    const jsonString = Buffer.from(result).toString('utf8')
    const resultJson = JSON.parse(jsonString);
    console.log(JSON.stringify(resultJson, null, 2));
}

main().catch(console.error);