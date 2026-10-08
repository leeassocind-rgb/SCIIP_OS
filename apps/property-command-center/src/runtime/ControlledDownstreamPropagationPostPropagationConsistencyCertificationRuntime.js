// SCIIP Explorer 3.0 — M3.26
// Controlled Downstream Propagation & Post-Propagation Consistency Certification Runtime
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>Object.freeze(v);

function pid(e){return e?.canonicalPropertyId??e?.propertyId??e?.canonical_property_id??e?.property_id??null;}
function project(corpus,target){
  let found=false,value,lastEventId=null,lastEventType=null;
  for(const e of (Array.isArray(corpus?.events)?corpus.events:[])){
    if(pid(e)!==target.propertyId) continue;
    for(const c of (Array.isArray(e?.changes)?e.changes:[])){
      if(c?.field!==target.fieldName) continue;
      found=true; value=clone(c.after); lastEventId=e?.eventId??null; lastEventType=e?.eventType??null;
    }
  }
  return {found,value,lastEventId,lastEventType};
}
function readJson(p,target){
  const bytes=fs.readFileSync(p);
  const corpus=JSON.parse(bytes.toString('utf8'));
  return {bytes,corpus,sha256:sha(bytes),eventCount:Array.isArray(corpus.events)?corpus.events.length:0,current:project(corpus,target)};
}
export function buildM326Runtime(){
 return freeze({
  contract:'SCIIP_EXPLORER_3_M3_26_CONTROLLED_DOWNSTREAM_PROPAGATION_POST_PROPAGATION_CONSISTENCY_CERTIFICATION_RUNTIME',
  version:'3.0-m3.26',status:'READY',
  m325CertificationRequired:true,authoritativeSourceImmutable:true,
  publicCopyNonAuthoritative:true,explicitPropagationApprovalRequired:true,
  oneDestinationOnly:true,canonicalEventCreationProhibited:true,
  authoritativeShaMustRemainStable:true,authoritativeEventCountMustRemainStable:true,
  targetStateParityRequired:true,eventCountParityRequired:true,byteParityRequired:true,
  semanticParityRequired:true,postPropagationCertificationRequired:true,
  syncAuthorityRelockRequired:true,automaticRetry:false,generalizedSyncAuthority:false,
  bulkWrites:false,multiDestinationWrites:false,persistentWriteAuthority:false,
  installerExecutesPropagation:false,certificationExecutesPropagation:false
 });
}
export function certifyPropagationGate({m325Evidence,publicPath}={}){
 const a=m325Evidence?.authoritativeCertification, r=m325Evidence?.authorityRelock, b=m325Evidence?.postCommitBaseline;
 const ok=m325Evidence?.status==='PASSED'&&a?.status==='CERTIFIED'&&r?.status==='CERTIFIED'&&
   r?.liveWriteAuthority===false&&b?.authoritativeSource&&b?.authoritativeSha256&&
   Number.isInteger(b?.canonicalEventCount);
 return freeze({
  status:ok?'CERTIFIED':'BLOCKED',
  state:ok?'CONTROLLED_PROPAGATION_GATE_CERTIFIED':'CONTROLLED_PROPAGATION_GATE_BLOCKED',
  authoritativeSource:b?.authoritativeSource??null,
  authoritativeSha256:b?.authoritativeSha256??null,
  authoritativeEventCount:b?.canonicalEventCount??null,
  target: a?.currentState ? freeze({
    propertyId:m325Evidence?.m324ATarget?.propertyId??null,
    fieldName:m325Evidence?.m324ATarget?.fieldName??null,
    expectedValue:b?.targetCurrentValue
  }):null,
  publicPath:publicPath??null,
  publicCopyAuthoritative:false,
  canonicalMutationAuthorized:false,
  propagationAuthorized:false
 });
}
export function executeControlledPropagation({gate,target,approval,receiptPath}={}){
 if(approval!=='YES')return freeze({status:'BLOCKED',state:'EXPLICIT_PROPAGATION_APPROVAL_REQUIRED'});
 if(gate?.status!=='CERTIFIED')return freeze({status:'BLOCKED',state:'PROPAGATION_GATE_NOT_CERTIFIED'});
 const src=gate.authoritativeSource,dst=gate.publicPath;
 if(!src||!fs.existsSync(src)||!dst)return freeze({status:'BLOCKED',state:'SOURCE_OR_DESTINATION_INVALID'});
 let before;
 try{before=readJson(src,target);}catch{return freeze({status:'BLOCKED',state:'AUTHORITATIVE_READ_FAILED'});}
 if(before.sha256!==gate.authoritativeSha256||before.eventCount!==gate.authoritativeEventCount)
   return freeze({status:'BLOCKED',state:'AUTHORITATIVE_BASELINE_DRIFT'});
 if(!before.current.found||!same(before.current.value,target.expectedValue))
   return freeze({status:'BLOCKED',state:'AUTHORITATIVE_TARGET_STATE_DRIFT'});

 const dstBeforeExists=fs.existsSync(dst);
 const dstBeforeBytes=dstBeforeExists?fs.readFileSync(dst):null;
 const tmp=dst+`.m326-${process.pid}.tmp`;
 try{
   fs.mkdirSync(path.dirname(dst),{recursive:true});
   fs.writeFileSync(tmp,before.bytes,{flag:'wx'});
   fs.renameSync(tmp,dst);
   const afterAuth=readJson(src,target), afterPublic=readJson(dst,target);
   const authUnchanged=afterAuth.sha256===before.sha256&&afterAuth.eventCount===before.eventCount;
   const byteParity=Buffer.compare(afterAuth.bytes,afterPublic.bytes)===0;
   const semanticParity=same(afterAuth.corpus,afterPublic.corpus);
   const eventCountParity=afterAuth.eventCount===afterPublic.eventCount;
   const targetParity=afterPublic.current.found&&same(afterPublic.current.value,target.expectedValue)&&
     afterPublic.current.lastEventId===afterAuth.current.lastEventId;
   const ok=authUnchanged&&byteParity&&semanticParity&&eventCountParity&&targetParity;
   if(!ok){
     if(dstBeforeExists)fs.writeFileSync(dst,dstBeforeBytes); else if(fs.existsSync(dst))fs.unlinkSync(dst);
     return freeze({status:'ROLLED_BACK',state:'POST_PROPAGATION_VERIFICATION_FAILED',authUnchanged,byteParity,semanticParity,eventCountParity,targetParity});
   }
   const receipt={
    contract:'SCIIP_EXPLORER_3_M3_26_PROPAGATION_RECEIPT',version:'3.0-m3.26',
    status:'PROPAGATED_AND_VERIFIED',authoritativeSource:src,publicCopy:dst,
    authoritativeSha256:afterAuth.sha256,publicSha256:afterPublic.sha256,
    authoritativeEventCount:afterAuth.eventCount,publicEventCount:afterPublic.eventCount,
    target:clone(target),targetValue:clone(afterPublic.current.value),
    lastEventId:afterPublic.current.lastEventId,byteParity,semanticParity,eventCountParity,targetParity,
    canonicalEventsCreated:0,authoritativeMutationPerformed:false
   };
   if(receiptPath){fs.mkdirSync(path.dirname(receiptPath),{recursive:true});fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');}
   return freeze({...receipt,status:'PASSED',state:'CONTROLLED_DOWNSTREAM_PROPAGATION_VERIFIED'});
 }catch(e){
   try{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}catch{}
   try{if(dstBeforeExists&&dstBeforeBytes)fs.writeFileSync(dst,dstBeforeBytes);}catch{}
   return freeze({status:'FAILED',state:'PROPAGATION_EXCEPTION',error:String(e?.message||e)});
 }
}
export function certifyPostPropagation({authoritativePath,publicPath,target,expectedSha,expectedEventCount}={}){
 try{
  const a=readJson(authoritativePath,target),p=readJson(publicPath,target);
  const authBaseline=a.sha256===expectedSha&&a.eventCount===expectedEventCount;
  const byteParity=Buffer.compare(a.bytes,p.bytes)===0,semanticParity=same(a.corpus,p.corpus);
  const eventCountParity=a.eventCount===p.eventCount;
  const targetParity=a.current.found&&p.current.found&&same(a.current.value,p.current.value)&&
    same(p.current.value,target.expectedValue)&&a.current.lastEventId===p.current.lastEventId;
  const ok=authBaseline&&byteParity&&semanticParity&&eventCountParity&&targetParity;
  return freeze({status:ok?'CERTIFIED':'BLOCKED',state:ok?'POST_PROPAGATION_CONSISTENCY_CERTIFIED':'POST_PROPAGATION_CONSISTENCY_FAILED',
   authBaseline,byteParity,semanticParity,eventCountParity,targetParity,authoritativeSha256:a.sha256,publicSha256:p.sha256,
   authoritativeEventCount:a.eventCount,publicEventCount:p.eventCount,targetCurrentValue:clone(p.current.value),
   publicCopyAuthoritative:false});
 }catch{return freeze({status:'BLOCKED',state:'POST_PROPAGATION_READ_FAILED'});}
}
export function buildSyncAuthorityRelock({certification}={}){
 const ok=certification?.status==='CERTIFIED';
 return freeze({contract:'SCIIP_EXPLORER_3_M3_26_SYNC_AUTHORITY_RELOCK',version:'3.0-m3.26',
  status:ok?'CERTIFIED':'BLOCKED',state:ok?'DOWNSTREAM_SYNC_AUTHORITY_RELOCKED':'DOWNSTREAM_SYNC_AUTHORITY_RELOCK_FAILED',
  syncAuthority:false,canonicalWriteAuthority:false,generalizedSyncAuthority:false,bulkWrites:false,
  multiDestinationWrites:false,automaticRetry:false,nextPropagationRequiresNewExplicitGovernance:true});
}
