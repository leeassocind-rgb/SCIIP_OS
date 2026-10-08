import assert from'node:assert/strict';
import fs from'node:fs';
import{buildVerifiedParcelIntelligence}from'../src/broker-product/property-explorer/intelligence/VerifiedParcelIntelligence.js';
import{reconcileParcelIdentity}from'../src/broker-product/property-explorer/intelligence/ParcelIdentityReconciliation.js';

const property={
  id:'BASE-DOUBLEDAY',
  address:'1001 Doubleday Ave',
  city:'Ontario',
  status:'EXISTING',
  parcelId:'0211232220000'
};

const lightBox={
  resolution:{
    confidence:48,
    conflictReport:{
      conflictCount:2,
      conflicts:[
        {field:'address',authoritativeValue:'1001 Doubleday Ave',candidateValue:'1001 DOUBLEDAY AVE'},
        {field:'parcelId',authoritativeValue:'0211232220000',candidateValue:'0211-232-22-0000'}
      ]
    },
    top:{
      parcel:{
        id:'02TESTDOUBLEDAYPARCEL00',
        parcelApn:'0211-232-22-0000',
        assessment:{
          apn:'0211-232-22-0000',
          assessedValue:{
            total:75650022,
            land:22877491,
            improvements:52772531,
            year:'2025'
          },
          marketValue:{total:null,year:null},
          improvementPercent:69.75,
          lot:{}
        },
        location:{streetAddress:'1001 DOUBLEDAY AVE'},
        county:'SAN BERNARDINO',
        fips:'06071',
        cbsa:{code:'40140'},
        census:{tract:'012700',blockGroup:'1'},
        derived:{calculatedLotArea:64831},
        landUse:{
          code:'0101',
          description:'DISTRIBUTION WAREHOUSE',
          normalized:{
            code:'6002',
            description:'DISTRIBUTION WAREHOUSE',
            categoryDescription:'HEAVY INDUSTRIAL'
          }
        },
        propertyType:{
          class:{code:'4',description:'Industrial'},
          type:{code:'38',description:'Warehouse'}
        },
        lastLoan:{
          recordingDate:'2026-07-10T00:00:00.000Z',
          lender:'TEST LENDER',
          value:12000000
        },
        transaction:{
          lastMarketSale:{
            value:42000000,
            transferDate:'2024-01-01T00:00:00.000Z',
            buyer:'BUYER LLC',
            seller:'SELLER LLC'
          }
        },
        structures:[{id:'05PRIMARY',isPrimary:true}]
      }
    }
  }
};

// Gate test: enrichment must be withheld when identity is not verified.
const withheld=buildVerifiedParcelIntelligence(property,lightBox,{verifiedMatch:false});
assert.equal(withheld.status,'WITHHELD_UNVERIFIED_IDENTITY');

// Reconciliation test: exact normalized APN + aligned situs address must produce VERIFIED_MATCH.
const reconciled=reconcileParcelIdentity(property,lightBox,{resolutionStatus:'REVIEW_REQUIRED',verifiedMatch:false});
assert.equal(reconciled.resolutionStatus,'VERIFIED_MATCH');
assert.equal(reconciled.verifiedMatch,true);
assert.equal(reconciled.reconciliation.apnEquivalent,true);
assert.equal(reconciled.reconciliation.addressAligned,true);

// Enrichment must attach only after verified identity.
assert.equal(reconciled.parcelEnrichment.status,'VERIFIED_ENRICHMENT');
assert.equal(reconciled.parcelEnrichment.canonicalAuthority,'SCIIP');
assert.equal(reconciled.parcelEnrichment.silentOverwrite,false);
assert.equal(reconciled.parcelEnrichment.assessment.total,75650022);
assert.equal(reconciled.parcelEnrichment.landUse.normalizedDescription,'DISTRIBUTION WAREHOUSE');
assert.equal(reconciled.parcelEnrichment.propertyType.typeDescription,'Warehouse');
assert.ok(reconciled.parcelEnrichment.site.calculatedLotAreaAcres>16);
assert.ok(reconciled.parcelEnrichment.site.calculatedLotAreaAcres<17);
assert.equal(reconciled.parcelEnrichment.structures.primaryId,'05PRIMARY');
assert.equal(reconciled.parcelEnrichment.lastLoan.value,12000000);
assert.equal(reconciled.parcelEnrichment.lastMarketSale.value,42000000);

// Direct verified enrichment path must produce the same governed behavior.
const direct=buildVerifiedParcelIntelligence(
  property,
  lightBox,
  {verifiedMatch:true,matchedExternalApn:'0211-232-22-0000'}
);
assert.equal(direct.status,'VERIFIED_ENRICHMENT');
assert.equal(direct.provider,'LightBox');

// UI wiring check.
const card=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx',import.meta.url),
  'utf8'
);
assert.ok(card.includes('VerifiedParcelIntelligenceCard'));
assert.ok(card.includes('<VerifiedParcelIntelligenceCard model={model}/>'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_10A_VERIFIED_PARCEL_INTELLIGENCE_CERTIFICATION_REPAIR',
  version:'3.0-m2.10a',
  status:'PASSED',
  testsRun:20,
  result:{
    reconciliationGate:'PRESERVED',
    verifiedMatch:'REQUIRED',
    apnNormalization:'PASSED',
    situsAddressAlignment:'PASSED',
    provider:'LIGHTBOX',
    canonicalAuthority:'SCIIP',
    assessment:'ACTIVE',
    siteCharacteristics:'ACTIVE',
    landUse:'ACTIVE',
    propertyType:'ACTIVE',
    recordedActivity:'ACTIVE',
    structureReferences:'ACTIVE',
    silentOverwrite:'FORBIDDEN'
  }
},null,2));
