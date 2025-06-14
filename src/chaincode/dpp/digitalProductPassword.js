'use strict';

const { Contract } = require('fabric-contract-api');

class DigitalProductPassport extends Contract {

    async initLedger(ctx) {
        console.info('Ledger initialized');
    }

    async registerDPP(ctx, dppId, manufacturerId, productName, manufactureDate, carbonFootprintKg, certifications) {
        const exists = await this.dppExists(ctx, dppId);
        if (exists) {
            throw new Error(`DPP ${dppId} já existe`);
        }

        const dpp = {
            dppId,
            manufacturerId,
            productData: {
                productName,
                manufactureDate,
                carbonFootprintKg: parseFloat(carbonFootprintKg),
                certifications: JSON.parse(certifications),
            },
            timestamp: new Date().toISOString(),
            owner: manufacturerId,
        };

        await ctx.stub.putState(dppId, Buffer.from(JSON.stringify(dpp)));
        return JSON.stringify(dpp);
    }

    async updateLifecycleEvent(ctx, dppId, eventType, eventData) {
        const dppJSON = await ctx.stub.getState(dppId);
        if (!dppJSON || dppJSON.length === 0) {
            throw new Error(`DPP ${dppId} não encontrado`);
        }

        const dpp = JSON.parse(dppJSON.toString());
        if (!dpp.lifecycleEvents) {
            dpp.lifecycleEvents = [];
        }

        dpp.lifecycleEvents.push({
            type: eventType,
            data: eventData,
            timestamp: new Date().toISOString(),
        });

        await ctx.stub.putState(dppId, Buffer.from(JSON.stringify(dpp)));
        return JSON.stringify(dpp);
    }

    async queryDPP(ctx, dppId) {
        const dppJSON = await ctx.stub.getState(dppId);
        if (!dppJSON || dppJSON.length === 0) {
            throw new Error(`DPP ${dppId} não encontrado`);
        }
        return dppJSON.toString();
    }

    async dppExists(ctx, dppId) {
        const dppJSON = await ctx.stub.getState(dppId);
        return dppJSON && dppJSON.length > 0;
    }

    async certifyCompliance(ctx, dppId, certifierId, certificate) {
        const dppJSON = await ctx.stub.getState(dppId);
        if (!dppJSON || dppJSON.length === 0) {
            throw new Error(`DPP ${dppId} não encontrado`);
        }

        const dpp = JSON.parse(dppJSON.toString());

        if (!dpp.certifications) {
            dpp.certifications = [];
        }

        dpp.certifications.push({
            issuedBy: certifierId,
            certificate,
            timestamp: new Date().toISOString()
        });

        await ctx.stub.putState(dppId, Buffer.from(JSON.stringify(dpp)));
        return JSON.stringify(dpp);
    }
}
