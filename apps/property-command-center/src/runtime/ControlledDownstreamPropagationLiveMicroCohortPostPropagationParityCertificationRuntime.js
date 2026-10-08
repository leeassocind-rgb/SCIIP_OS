// SCIIP Explorer 3.0 — M3.34
// Controlled Downstream Propagation of Live Micro-Cohort & Post-Propagation Parity Certification Runtime

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>Object.freeze(v);

export function buildM334Runtime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_34_CONTROLLED_DOWNSTREAM_PROPAGATION_LIVE_MICRO_COHORT_POST_PROPAGATION_PARITY_CERTIFICATION_RUNTIME',
    version:'3.0-m3.34',
    status:'READY',
    m333ReadinessRequired:true,
    explicitPropagationApprovalRequired:true,
    oneGeneratedDestinationOnly:true,
    authoritativeSourceImmutable:true,
    canonicalEventCreationProhibited:true,
    authoritativeShaMustRemainStable:true,
    authoritativeEventCountMustRemainStable:true,
    byteParityRequired:true,
    semanticParityRequired:true,
    eventCountParityRequired:true,
    targetStateParityRequired:true,
    syncAuthorityRelockRequired:true,
    liveMutationAllowed:false,
    generalizedSyncAuthority:false,
    bulkWrites:false,
    multiDestinationWrites:false,
    automaticRetry:false,
    installerExecutesPropagation:false,
    certificationExecutesPropagation:false
  });
}

function pid(e){return e?.canonicalPropertyId??e?.propertyId??e?.canonical_property_id??e?.property_id??null;}
function project(corpus,propertyId,fieldName){
  let found=false,value,lastEventId=null;
  for(const e of (Array.isArray(corpus?.events)?corpus.events:[])){
    if(pid(e)!==propertyId)continue;
    for(const c of (Array.isArray(e?.changes)?e.changes:[])){
      if(c?.field!==fieldName)continue;
      found=true;value=clone(c.after);lastEventId=e?.eventId??null;
    }
  }
  return {found,value,lastEventId};
}
function readJson(p){
  const bytes=fs.readFileSync(p);
  const corpus=JSON.parse(bytes.toString('utf8'));
  return {bytes,corpus,sha256:sha(bytes),eventCount:Array.isArray(corpus?.events)?corpus.events.length:0};
}

export function certifyPropagationGate({m333Evidence}={}){
  const r=m333Evidence?.downstreamPropagationReadiness;
  const a=m333Evidence?.authoritativeCertification;
  const ok=
    m333Evidence?.status==='PASSED' &&
    r?.status==='CERTIFIED' &&
    r?.separateExplicitPropagationMilestoneRequired==='M3.34' &&
    r?.propagationAuthorized===false &&
    r?.canonicalMutationAuthorized===false &&
    a?.status==='CERTIFIED' &&
    a?.allEventsExact===true &&
    a?.allStatesExact===true;

  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'M334_CONTROLLED_PROPAGATION_GATE_CERTIFIED':'M334_CONTROLLED_PROPAGATION_GATE_BLOCKED',
    authoritativeSource:r?.authoritativeSource??null,
    authoritativeSha256:r?.authoritativeSha256??null,
    authoritativeEventCount:r?.authoritativeEventCount??null,
    publicCopy:r?.publicCopy??null,
    publicCopyAuthoritative:false,
    propagationAuthorized:false,
    canonicalMutationAuthorized:false
  });
}

export function executeControlledPropagation({
  gate,
  approval,
  stateTargets=[],
  receiptPath
}={}){
  if(approval!=='YES')return freeze({status:'BLOCKED',state:'EXPLICIT_PROPAGATION_APPROVAL_REQUIRED'});
  if(gate?.status!=='CERTIFIED')return freeze({status:'BLOCKED',state:'PROPAGATION_GATE_NOT_CERTIFIED'});
  const src=gate.authoritativeSource,dst=gate.publicCopy;
  if(!src||!fs.existsSync(src)||!dst)return freeze({status:'BLOCKED',state:'SOURCE_OR_DESTINATION_INVALID'});

  let before;
  try{before=readJson(src);}catch{return freeze({status:'BLOCKED',state:'AUTHORITATIVE_READ_FAILED'});}
  if(before.sha256!==gate.authoritativeSha256||before.eventCount!==gate.authoritativeEventCount){
    return freeze({status:'BLOCKED',state:'AUTHORITATIVE_BASELINE_DRIFT'});
  }

  const targetChecks=stateTargets.map(t=>{
    const cur=project(before.corpus,t.propertyId,t.fieldName);
    return freeze({
      propertyId:t.propertyId,fieldName:t.fieldName,
      expectedValue:clone(t.expectedValue),observedValue:clone(cur.value),
      stateOk:cur.found&&same(cur.value,t.expectedValue),
      lastEventId:cur.lastEventId
    });
  });
  if(targetChecks.length!==3||!targetChecks.every(x=>x.stateOk)){
    return freeze({status:'BLOCKED',state:'AUTHORITATIVE_TARGET_STATE_MISMATCH',targetChecks:freeze(targetChecks)});
  }

  const dstBeforeExists=fs.existsSync(dst);
  const dstBeforeBytes=dstBeforeExists?fs.readFileSync(dst):null;
  const tmp=`${dst}.m334-${process.pid}.tmp`;

  try{
    fs.mkdirSync(path.dirname(dst),{recursive:true});
    fs.writeFileSync(tmp,before.bytes,{flag:'wx'});
    fs.renameSync(tmp,dst);

    const afterAuth=readJson(src);
    const afterPublic=readJson(dst);
    const authStable=afterAuth.sha256===before.sha256&&afterAuth.eventCount===before.eventCount;
    const byteParity=Buffer.compare(afterAuth.bytes,afterPublic.bytes)===0;
    const semanticParity=same(afterAuth.corpus,afterPublic.corpus);
    const eventCountParity=afterAuth.eventCount===afterPublic.eventCount;
    const propagatedStates=stateTargets.map(t=>{
      const a=project(afterAuth.corpus,t.propertyId,t.fieldName);
      const p=project(afterPublic.corpus,t.propertyId,t.fieldName);
      return freeze({
        propertyId:t.propertyId,fieldName:t.fieldName,
        expectedValue:clone(t.expectedValue),
        authoritativeValue:clone(a.value),
        publicValue:clone(p.value),
        stateParity:a.found&&p.found&&same(a.value,t.expectedValue)&&same(p.value,t.expectedValue)&&a.lastEventId===p.lastEventId
      });
    });
    const targetStateParity=propagatedStates.length===3&&propagatedStates.every(x=>x.stateParity);
    const ok=authStable&&byteParity&&semanticParity&&eventCountParity&&targetStateParity;

    if(!ok){
      if(dstBeforeExists)fs.writeFileSync(dst,dstBeforeBytes);
      else if(fs.existsSync(dst))fs.unlinkSync(dst);
      return freeze({
        status:'ROLLED_BACK',
        state:'POST_PROPAGATION_PARITY_VERIFICATION_FAILED',
        authStable,byteParity,semanticParity,eventCountParity,targetStateParity
      });
    }

    const receipt={
      contract:'SCIIP_EXPLORER_3_M3_34_CONTROLLED_DOWNSTREAM_PROPAGATION_RECEIPT',
      version:'3.0-m3.34',
      status:'PROPAGATED_AND_VERIFIED',
      authoritativeSource:src,
      publicCopy:dst,
      authoritativeSha256:afterAuth.sha256,
      publicSha256:afterPublic.sha256,
      authoritativeEventCount:afterAuth.eventCount,
      publicEventCount:afterPublic.eventCount,
      byteParity,semanticParity,eventCountParity,targetStateParity,
      propagatedStates,
      canonicalEventsCreated:0,
      authoritativeMutationPerformed:false
    };
    if(receiptPath){
      fs.mkdirSync(path.dirname(receiptPath),{recursive:true});
      fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');
    }
    return freeze({...receipt,status:'PASSED',state:'LIVE_MICRO_COHORT_DOWNSTREAM_PROPAGATION_VERIFIED'});
  }catch(e){
    try{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}catch{}
    try{if(dstBeforeExists&&dstBeforeBytes)fs.writeFileSync(dst,dstBeforeBytes);}catch{}
    return freeze({status:'FAILED',state:'PROPAGATION_EXCEPTION',error:String(e?.message||e)});
  }
}

export function certifyPostPropagation({
  authoritativePath,
  publicPath,
  expectedSha256,
  expectedEventCount,
  stateTargets=[]
}={}){
  try{
    const a=readJson(authoritativePath),p=readJson(publicPath);
    const authBaseline=a.sha256===expectedSha256&&a.eventCount===expectedEventCount;
    const byteParity=Buffer.compare(a.bytes,p.bytes)===0;
    const semanticParity=same(a.corpus,p.corpus);
    const eventCountParity=a.eventCount===p.eventCount;
    const stateChecks=stateTargets.map(t=>{
      const av=project(a.corpus,t.propertyId,t.fieldName);
      const pv=project(p.corpus,t.propertyId,t.fieldName);
      return freeze({
        propertyId:t.propertyId,fieldName:t.fieldName,
        expectedValue:clone(t.expectedValue),
        authoritativeValue:clone(av.value),
        publicValue:clone(pv.value),
        stateParity:av.found&&pv.found&&same(av.value,t.expectedValue)&&same(pv.value,t.expectedValue)&&av.lastEventId===pv.lastEventId
      });
    });
    const targetStateParity=stateChecks.length===3&&stateChecks.every(x=>x.stateParity);
    const ok=authBaseline&&byteParity&&semanticParity&&eventCountParity&&targetStateParity;

    return freeze({
      status:ok?'CERTIFIED':'BLOCKED',
      state:ok?'POST_PROPAGATION_PARITY_CERTIFIED':'POST_PROPAGATION_PARITY_FAILED',
      authBaseline,byteParity,semanticParity,eventCountParity,targetStateParity,
      authoritativeSha256:a.sha256,publicSha256:p.sha256,
      authoritativeEventCount:a.eventCount,publicEventCount:p.eventCount,
      stateChecks:freeze(stateChecks),
      publicCopyAuthoritative:false
    });
  }catch{
    return freeze({status:'BLOCKED',state:'POST_PROPAGATION_READ_FAILED'});
  }
}

export function buildSyncAuthorityRelock({certification}={}){
  const ok=certification?.status==='CERTIFIED';
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_34_SYNC_AUTHORITY_RELOCK',
    version:'3.0-m3.34',
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'LIVE_MICRO_COHORT_DOWNSTREAM_SYNC_AUTHORITY_RELOCKED':'DOWNSTREAM_SYNC_AUTHORITY_RELOCK_FAILED',
    syncAuthority:false,
    canonicalWriteAuthority:false,
    generalizedSyncAuthority:false,
    bulkWrites:false,
    multiDestinationWrites:false,
    automaticRetry:false,
    nextPropagationRequiresNewExplicitGovernance:true
  });
}
