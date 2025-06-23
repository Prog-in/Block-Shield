'use strict';

const { Contract } = require('fabric-contract-api');

const lifeCycleEventType = {
    REGISTRATION: "registration",
    UPDATE: "update",
    REPAIR: "repair",
    MAINTENANCE: "maintenance",
    RECYCLING: "recycling"
}

const complianceStatus = {
    WAITING_COMPLIANCE_CERTIFICATION: "waiting-compliance-certification",
    COMPLIANT: "compliant",
    NON_COMPLIANT: "non-compliant"
}

class DigitalProductPassport extends Contract {

    async initLedger(ctx) {
        console.info('Ledger initialized');
    }

    // Creates a new product passport with manufacturer credentials
    async registerDPP(ctx, dppId, manufacturerId, productName, manufactureDate, carbonFootprintKg, certifications, dppReferences) {
        const exists = await this.dppExists(ctx, dppId);
        if (exists) {
            throw new Error(`DPP ${dppId} já existe`);
        }

        const dpp = {
            dppId,
            manufacturerId,
            ownerId: manufacturerId,
            productData: {
                productName,
                manufactureDate,
                carbonFootprintKg: parseFloat(carbonFootprintKg),
                certifications: JSON.parse(certifications),
            },
            dppReferences: [...new Set(JSON.parse(dppReferences))],
            lifecycleEvents: [
                {
                    type: lifeCycleEventType.REGISTRATION,
                    data: "Registration of the DPP",
                    timestamp: manufactureDate
                }
            ],
            complianceStatus: {
                status: complianceStatus.WAITING_COMPLIANCE_CERTIFICATION,
                flaggedBy: null,
                reason: null,
                timestamp: null
            }
        };

        await ctx.stub.putState(dppId, Buffer.from(JSON.stringify(dpp)));
        return JSON.stringify(dpp);
    }

    // Appends repair, maintenance, or recycling information
    async updateLifecycleEvent(ctx, dppId, newOwnerId, dppReferencesToBeRemoved, dppReferencesToBeAdded, newCertifications, eventType, eventData, timestamp) {
        const dppJSON = await ctx.stub.getState(dppId);
        if (!dppJSON || dppJSON.length === 0) {
            throw new Error(`DPP ${dppId} não encontrado`);
        }

        const dpp = JSON.parse(dppJSON.toString());

        dpp.ownerId = newOwnerId;
        dpp.productData.certifications.push(...JSON.parse(newCertifications));

        const dppRefs = new Set(dpp.dppReferences);
        JSON.parse(dppReferencesToBeRemoved).forEach(dppRef => dppRefs.delete(dppRef));
        JSON.parse(dppReferencesToBeAdded).forEach(dppRef => dppRefs.add(dppRef));
        dpp.dppReferences = [...dppRefs];

        dpp.lifecycleEvents.push({
            type: eventType,
            data: eventData,
            timestamp
        });

        dpp.complianceStatus = {
            status: complianceStatus.WAITING_COMPLIANCE_CERTIFICATION,
            flaggedBy: null,
            reason: null,
            timestamp: null
        }

        await ctx.stub.putState(dppId, Buffer.from(JSON.stringify(dpp)));
        return JSON.stringify(dpp);
    }

    // Enables a certifier to digitally sign and approve DPP
    async certifyCompliance(ctx, dppId, certifierId, certificate, timestamp) {
        const dppJSON = await ctx.stub.getState(dppId);
        if (!dppJSON || dppJSON.length === 0) {
            throw new Error(`DPP ${dppId} não encontrado`);
        }

        const dpp = JSON.parse(dppJSON.toString());

        dpp.productData.certifications.push({
            issuedBy: certifierId,
            certificate,
            timestamp: timestamp
        });

        await ctx.stub.putState(dppId, Buffer.from(JSON.stringify(dpp)));
        return JSON.stringify(dpp);
    }

    // Retrieves product data for consumer or auditor use
    async queryDPP(ctx, dppId) {
        const dppJSON = await ctx.stub.getState(dppId);
        if (!dppJSON || dppJSON.length === 0) {
            throw new Error(`DPP ${dppId} não encontrado`);
        }
        return dppJSON.toString();
    }

    // Flags a product as non-compliant (by regulators or authorities)
    async flagNonCompliance(ctx, dppId, flaggedBy, reason, timestamp) {
        const dppJSON = await ctx.stub.getState(dppId);
        if (!dppJSON || dppJSON.length === 0) {
            throw new Error(`DPP ${dppId} não encontrado`);
        }

        const dpp = JSON.parse(dppJSON.toString());

        if (dpp.complianceStatus === complianceStatus.NON_COMPLIANT) {
            throw new Error(`DPP ${dppId} is already non-compliant`);
        }

        dpp.complianceStatus = {
            status: complianceStatus.NON_COMPLIANT,
            flaggedBy: flaggedBy,
            reason: reason,
            timestamp: timestamp
        };

        await ctx.stub.putState(dppId, Buffer.from(JSON.stringify(dpp)));
        return JSON.stringify(dpp);
    }

    // Flags a product as compliant (by regulators or authorities)
    async flagCompliance(ctx, dppId, flaggedBy, timestamp) {
        const dppJSON = await ctx.stub.getState(dppId);
        if (!dppJSON || dppJSON.length === 0) {
            throw new Error(`DPP ${dppId} não encontrado`);
        }

        const dpp = JSON.parse(dppJSON.toString());

        if (dpp.complianceStatus === complianceStatus.COMPLIANT) {
            throw new Error(`DPP ${dppId} is already compliant`);
        }

        dpp.complianceStatus = {
            status: complianceStatus.COMPLIANT,
            flaggedBy: flaggedBy,
            reason: null,
            timestamp: timestamp
        };

        await ctx.stub.putState(dppId, Buffer.from(JSON.stringify(dpp)));
        return JSON.stringify(dpp);
    }

    // Returns true if the dpp with dppId exists in the blockchain. returns False otherwise.
    async dppExists(ctx, dppId) {
        const dppJSON = await ctx.stub.getState(dppId);
        return dppJSON && dppJSON.length > 0;
    }
}

module.exports = DigitalProductPassport;
