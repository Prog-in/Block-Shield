import fabricGateway from '@hyperledger/fabric-gateway';
const { connect, signers } = fabricGateway;
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { createPrivateKey } from 'crypto';
import { resolve, dirname } from 'path';
import { credentials, Client } from '@grpc/grpc-js';

async function main() {

    // getting the connection profile
    const filename = fileURLToPath(import.meta.url);
    const clientDir = dirname(filename)
    const ccpPath = resolve(clientDir, '../config/connection-org1.json');
    const ccp = JSON.parse(readFileSync(ccpPath, 'utf8'));

    // getting the peer information
    const org1 = 'peer0.org1.example.com'
    const peer = ccp.peers[org1];
    const peerEndpoint = peer.url.replace('grpcs://', '');
    const tlsCACert = peer.tlsCACerts.pem;
    const grpcOptions = peer.grpcOptions;

    // Loading the informations of the peer
    const tlsRootCert = Buffer.from(tlsCACert);
    const tlsCredentials = credentials.createSsl(tlsRootCert);

    // Loading the user identity
    const mspId = 'Org1MSP';
    const certPath = resolve(clientDir, 'wallet/appUser/cert.pem');
    const keyPath = resolve(clientDir, 'wallet/appUser/key.pem');

    const identity = {
        mspId,
        credentials: readFileSync(certPath),
    };

    // Creating a signing implementation
    const privateKeyPem = readFileSync(keyPath, 'utf8');
    const privateKey = createPrivateKey(privateKeyPem);
    const signer = signers.newPrivateKeySigner(privateKey);

    const client = new Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': grpcOptions['ssl-target-name-override'],
        'grpc.default_authority':grpcOptions['hostnameOverride']
    });

    // Creating the connection
    const connection = connect({client, identity, signer});
    // Getting the network
    const network = connection.getNetwork('dppchannel');
    // Getting the (default) smart contract of the chaincode
    const contract = network.getContract('dpp');

    const dpp1_certifications = [
        {
            "issuedBy": "EnvAgency-EU",
            "certificate": "ISO 14001:2015 - Environmental Management",
            "timestamp": "2025-06-21T19:45:00.000Z"
        },
    ];
    const dpp1_register = await contract.submitTransaction(
        'registerDPP',
        'DPP-001',
        'MFG-001',
        'EcoLight',
        '01-01-2025',
        '4.3',
        JSON.stringify(dpp1_certifications),
        JSON.stringify([])
    );

    print_result("DPP 1 registered with success:", dpp1_register);

    const dpp1_update = await contract.submitTransaction(
        'updateLifecycleEvent',
        'DPP-001',
        'MFG-002',
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([{
            "issuedBy": "CEBody-123",
            "certificate": "CE Safety Directive 2006/42/EC",
            "timestamp": "2025-06-22T08:30:00.000Z"
        }]),
        "update",
        "New certification obtained",
        '03-01-2025'
    );

    print_result("DPP 1 updated with success:", dpp1_update);

    const dpp2_certifications = [
        {
            "issuedBy": "GovAuditAgency",
            "certificate": "ISO14001",
            "timestamp": "2025-06-21T20:00:00Z"
        }
    ];
    const dpp2_register = await contract.submitTransaction(
        'registerDPP',
        'DPP-002',
        'ABC-001',
        'FooBar',
        '07-02-2025',
        '10.7',
        JSON.stringify(dpp2_certifications),
        JSON.stringify(['DPP-001'])
    );

    print_result("DPP 2 registered with success:", dpp2_register);

    const queried_dpp = await contract.submitTransaction(
        'queryDPP',
        'DPP-002'
    );

    print_result("Queried DPP:", queried_dpp);

    const compliant_dpp1 = await contract.submitTransaction(
        'flagCompliance',
        'DPP-001',
        'GovInspection-Unit01',
        '01-03-2025'
    );

    print_result("Compliant DPP1:", compliant_dpp1)

    const non_compliant_dpp2 = await contract.submitTransaction(
        'flagNonCompliance',
        'DPP-002',
        'GovInspection-Unit02',
        'Failure to meet safety regulation CE 2006/42/EC',
        '09-03-2025'
    );

    print_result("Non-Compliant DPP2:", non_compliant_dpp2)
}

function print_result(message, result) {
    console.log(message);
    const jsonString = Buffer.from(result).toString('utf8')
    const resultJson = JSON.parse(jsonString);
    console.log(JSON.stringify(resultJson, null, 2));
    console.log()
}

main().catch(console.error);