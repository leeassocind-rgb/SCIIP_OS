import assert from'node:assert/strict';
import{normalizeParcelApn,normalizeStreet,reconcileParcelIdentity}from'../src/broker-product/property-explorer/intelligence/ParcelIdentityReconciliation.js';

const checks=[];
const check=(name,v)=>{assert.ok(v,name);checks.push({name,status:'PASSED'});};

check('APN punctuation normalization',
  normalizeParcelApn('0211-232-22-0000')===normalizeParcelApn('0211232220000'));
check('Street suffix normalization',
  normalizeStreet('1001 Doubleday Avenue')==='1001 doubleday ave');

const property={id:'TEST',address:'1001 Doubleday Ave',city:'Ontario',status:'EXISTING',parcelId:'0211-232-22-0000'};
const state={resolution:{top:{parcel:{parcelApn:'0211232220000',assessment:{apn:'0211-232-22-0000'},location:{streetAddress:'1001 DOUBLEDAY AVE'}}}}};
const base={resolutionStatus:'REVIEW_REQUIRED',confidence:48,conflictCount:2,verifiedMatch:false};
const result=reconcileParcelIdentity(property,state,base);

check('Normalized APN matches',result.reconciliation.apnEquivalent);
check('Situs address matches',result.reconciliation.addressAligned);
check('Two-factor identity verifies existing parcel',result.resolutionStatus==='VERIFIED_MATCH');
check('Strong identity confidence threshold',result.confidence>=92);
check('Formatting-only conflict removed',result.conflictCount===1);
check('No silent overwrite',result.reconciliation.silentOverwrite===false);

const future=reconcileParcelIdentity({...property,status:'UNDER CONSTRUCTION'},state,base);
check('Future property does not auto-verify',future.resolutionStatus!=='VERIFIED_MATCH');
check('Future property remains review gated',future.reviewRequired===true);

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_9_3_PARCEL_IDENTITY_RECONCILIATION',
  version:'3.0-m2.9.3',
  status:'PASSED',
  testsRun:checks.length,
  result:{
    apnNormalization:'ACTIVE',
    addressNormalization:'ACTIVE',
    identityRule:'EXACT_NORMALIZED_APN_PLUS_ALIGNED_SITUS_ADDRESS',
    futureStateAutoVerification:'DISABLED',
    silentOverwrite:'DISABLED'
  },
  checks
},null,2));
