#!/bin/bash
. constants.env

set -e

CA_TLS_CERT="$FABRIC_SAMPLES/test-network/organizations/fabric-ca/org1/tls-cert.pem"
FABRIC_CA_CLIENT_BIN="$FABRIC_SAMPLES/bin/fabric-ca-client"

ADMIN_HOME=$CLIENT/wallet/admin

ADMIN_ID=admin
ADMIN_SECRET=adminpw

# =============================
# 1. enrolling of the Admin
# =============================
export FABRIC_CA_CLIENT_HOME=$ADMIN_HOME
mkdir -p $FABRIC_CA_CLIENT_HOME

if [ ! -f "$ADMIN_HOME/msp/signcerts/cert.pem" ]; then
  echo "Matriculando admin..."
  $FABRIC_CA_CLIENT_BIN enroll \
    -u https://$ADMIN_ID:$ADMIN_SECRET@localhost:7054 \
    --tls.certfiles $CA_TLS_CERT \
    -M $FABRIC_CA_CLIENT_HOME
else
  echo "Admin já matriculado. Pulando."
fi