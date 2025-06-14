const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
    const walletPath = path.join(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get('appUser');
    if (!identity) {
        console.log('⚠️  Identidade "appUser" não encontrada na wallet');
        return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork('dppchannel');
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
    await gateway.disconnect();
}

main();
