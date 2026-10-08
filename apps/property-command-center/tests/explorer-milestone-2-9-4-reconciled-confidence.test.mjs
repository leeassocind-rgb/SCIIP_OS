import assert from'node:assert/strict';
import{reconcileParcelIdentity}from'../src/broker-product/property-explorer/intelligence/ParcelIdentityReconciliation.js';
import{buildReconciliationPresentation}from'../src/broker-product/property-explorer/intelligence/LiveGovernedReconciliationPresentation.js';

const checks=[];
const check=(name,v)=>{assert.ok(v,name);checks.push({name,status:'PASSED'});};

const property={
  id:'TEST-DOUBLEDAY',
  address:'1001 Doubleday Ave',
  city:'Ontario',
  status:'EXISTING',
  parcelId:'0211-232-22-0000',
  conflicts:[{field:'owner'},{field:'buildingSf'}]
};

const state={
  resolution:{
    top:{
      parcel:{
        parcelApn:'0211232220000',
        location:{streetAddress:'1001 DOUBLEDAY AVE'}
      }
    }
  }
};

const base={
  resolutionStatus:'REVIEW_REQUIRED',
  confidence:48,
  matchConfidence:48,
  conflictCount:2,
  verifiedMatch:false
};

const model=reconcileParcelIdentity(property,state,base);
const view=buildReconciliationPresentation(model,property);

check('Identity verifies',model.resolutionStatus==='VERIFIED_MATCH');
check('Identity confidence promoted',model.identityConfidence>=92);
check('Legacy matchConfidence now reflects governed identity',model.matchConfidence===model.identityConfidence);
check('Primary confidence reflects governed identity',model.confidence===model.identityConfidence);
check('Raw external confidence preserved',model.sourceConfidence===48);
check('Formatting identity conflict removed',model.identityConflictCount===1);
check('Canonical record conflicts preserved separately',model.canonicalConflictCount===2);
check('Presentation uses identity confidence',view.identityConfidenceLabel==='92%');
check('Presentation preserves source candidate score',view.sourceConfidenceLabel==='48%');
check('Presentation distinguishes conflict domains',view.identityConflicts===1&&view.canonicalConflicts===2);

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_9_4_RECONCILED_CONFIDENCE_CONFLICT_EVIDENCE',
  version:'3.0-m2.9.4',
  status:'PASSED',
  testsRun:checks.length,
  result:{
    identityConfidence:view.identityConfidence,
    sourceCandidateConfidence:view.sourceConfidence,
    identityConflicts:view.identityConflicts,
    canonicalRecordConflicts:view.canonicalConflicts,
    semanticSeparation:'ACTIVE'
  },
  checks
},null,2));
