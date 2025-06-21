#!/bin/bash
. constants.env

set -e

# Caminhos
CA_URL=https://localhost:7054
CA_NAME=ca-org1
CA_TLS_CERT="$FABRIC_SAMPLES/test-network/organizations/fabric-ca/org1/tls-cert.pem"
FABRIC_CA_CLIENT_BIN="$FABRIC_SAMPLES/bin/fabric-ca-client"

ADMIN_HOME=$CLIENT/wallet/admin
APPUSER_HOME=$CLIENT/wallet/.fabric-ca-client
DEST_DIR=$CLIENT/wallet/appUser

# Credenciais
APPUSER_ID=appUser
APPUSER_SECRET=appUserpw
ROLE=client

# =============================
# 1. Registrar o appUser com o admin autenticado
# =============================
export FABRIC_CA_CLIENT_HOME=$ADMIN_HOME

echo "Registrando usuário appUser..."
$FABRIC_CA_CLIENT_BIN register \
  --id.name $APPUSER_ID \
  --id.secret $APPUSER_SECRET \
  --id.type $ROLE \
  --id.affiliation org1.department1 \
  --id.attrs "hf.Registrar.Roles=$ROLE" \
  --tls.certfiles $CA_TLS_CERT \
  --url $CA_URL

# =============================
# 2. Enroll do appUser
# =============================
export FABRIC_CA_CLIENT_HOME=$APPUSER_HOME
mkdir -p $FABRIC_CA_CLIENT_HOME

echo "Matriculando appUser..."
$FABRIC_CA_CLIENT_BIN enroll \
  -u https://$APPUSER_ID:$APPUSER_SECRET@localhost:7054 \
  --tls.certfiles $CA_TLS_CERT \
  -M $FABRIC_CA_CLIENT_HOME/$APPUSER_ID

# =============================
# 3. Copiar identidade para destino padrão
# =============================
mkdir -p $DEST_DIR

cp $APPUSER_HOME/$APPUSER_ID/signcerts/cert.pem $DEST_DIR/cert.pem
cp $(find $APPUSER_HOME/$APPUSER_ID/keystore -name '*_sk' -print -quit) $DEST_DIR/key.pem

echo "Identidade do appUser criada em $DEST_DIR"