import fs from 'node:fs';
import crypto from 'node:crypto';

const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>Object.freeze(v);

function pid(e){return e?.canonicalPropertyId??e?.propertyId??e?.canonical_property_id??e?.property_id??null;}
function project(corpus,target){
  let found=false,value,lastEventId=null;
  for(const e of (Array.isArray(corpus?.events)?corpus.events:[])){
    if(pid(e)!==target.propertyId) continue;
    for(const c of (Array.isArray(e?.changes)?e.changes:[])){
      if(c?.field!==target.fieldName) continue;
      found=true; value=clone(c.after); lastEventId=e?.eventId??null;
    }
  }
  return {found,value,lastEventId};
}
function read(source,target){
  const bytes=fs.readFileSync(source);
  const corpus=JSON.parse(bytes.toString('utf8'));
  return {bytes,corpus,sha256:sha(bytes),current:project(corpus,target)};
}

export function buildM324ARuntime(){
 return freeze({
  contract:'SCIIP_EXPLORER_3_M3_24A_M323D_FINAL_EXECUTION_WINDOW_BINDING_EXPLICIT_LIVE_CANARY_EXECUTOR',
  version:'3.0-m3.24a',status:'READY',
  m323DManifestRequired:true,exactManifestBindingRequired:true,exactSingleUseTokenRequired:true,
  finalShaCheckRequired:true,finalStateCheckRequired:true,oneTransactionOnly:true,onePropertyOnly:true,
  oneFieldOnly:true,readAfterWriteRequired:true,rollbackOnVerificationFailure:true,tokenConsumptionRequired:true,
  explicitOperatorApprovalRequired:true,buildProhibited:true,assetSyncProhibited:true,automaticRetry:false,
  generalizedWriteAuthority:false,bulkWrites:false,multiPropertyWrites:false,persistentWriteAuthority:false,
  installerExecutesLiveWrite:false,certificationExecutesLiveWrite:false,canonicalCommittedCountAtInstall:0
 });
}

export function certifyM323DBinding({evidence}={}){
 const m=evidence?.finalExecutionWindowManifest;
 const c=evidence?.immediateFinalWindowCheck;
 const ok=evidence?.status==='PASSED'&&m?.status==='CERTIFIED'&&m?.readyForM324Execution===true&&
   m?.singleUseOnly===true&&m?.buildProhibitedDuringWindow===true&&m?.assetSyncProhibitedDuringWindow===true&&
   c?.status==='CERTIFIED'&&c?.shaOk===true&&c?.stateOk===true;
 return freeze({
  status:ok?'CERTIFIED':'BLOCKED',
  state:ok?'M323D_FINAL_EXECUTION_WINDOW_BOUND':'M323D_FINAL_EXECUTION_WINDOW_BINDING_FAILED',
  manifestId:m?.manifestId??null,singleUseToken:m?.singleUseToken??null,target:clone(m?.target),
  sourcePath:m?.authoritativeSource??null,sourceSha256:m?.authoritativeSourceSha256??null
 });
}

export function finalPreWriteCheck({binding}={}){
 if(binding?.status!=='CERTIFIED'||!binding.sourcePath||!fs.existsSync(binding.sourcePath))
   return freeze({status:'BLOCKED',state:'BINDING_OR_SOURCE_INVALID'});
 let r;try{r=read(binding.sourcePath,binding.target);}catch{return freeze({status:'BLOCKED',state:'FINAL_PREWRITE_READ_FAILED'});}
 const shaOk=r.sha256===binding.sourceSha256;
 const stateOk=r.current.found&&same(r.current.value,binding.target.beforeValue);
 return freeze({
  status:shaOk&&stateOk?'CERTIFIED':'BLOCKED',
  state:shaOk&&stateOk?'FINAL_PREWRITE_STATE_CERTIFIED':'FINAL_PREWRITE_STATE_BLOCKED',
  shaOk,stateOk,expectedSha256:binding.sourceSha256,observedSha256:r.sha256,
  expectedBeforeValue:clone(binding.target.beforeValue),observedCurrentValue:clone(r.current.value)
 });
}

function eventId(manifestId,target,sourceSha){
 return 'EVENT-'+sha(Buffer.from(`${manifestId}|${target.propertyId}|${target.fieldName}|${JSON.stringify(target.afterValue)}|${sourceSha}`)).slice(0,20).toUpperCase();
}

export function executeExplicitLiveCanary({
 binding,manifestId,singleUseToken,approval,tokenLedgerPath,receiptPath,auditPath
}={}){
 if(approval!=='YES') return freeze({status:'BLOCKED',state:'EXPLICIT_OPERATOR_APPROVAL_REQUIRED'});
 if(binding?.status!=='CERTIFIED') return freeze({status:'BLOCKED',state:'M323D_BINDING_NOT_CERTIFIED'});
 if(manifestId!==binding.manifestId) return freeze({status:'BLOCKED',state:'MANIFEST_ID_MISMATCH'});
 if(singleUseToken!==binding.singleUseToken) return freeze({status:'BLOCKED',state:'SINGLE_USE_TOKEN_MISMATCH'});
 if(!tokenLedgerPath||!receiptPath||!auditPath) return freeze({status:'BLOCKED',state:'PERSISTENCE_PATHS_REQUIRED'});

 let ledger={consumedTokens:[]};
 if(fs.existsSync(tokenLedgerPath)){try{ledger=JSON.parse(fs.readFileSync(tokenLedgerPath,'utf8'));}catch{}}
 if(!Array.isArray(ledger.consumedTokens)) ledger.consumedTokens=[];
 if(ledger.consumedTokens.includes(singleUseToken)) return freeze({status:'BLOCKED',state:'SINGLE_USE_TOKEN_ALREADY_CONSUMED'});

 const pre=finalPreWriteCheck({binding});
 if(pre.status!=='CERTIFIED') return freeze({status:'BLOCKED',state:'FINAL_PREWRITE_CHECK_FAILED',preWriteVerification:pre});

 const source=binding.sourcePath,target=binding.target;
 const beforeBytes=fs.readFileSync(source);
 let corpus;
 try{corpus=JSON.parse(beforeBytes.toString('utf8'));}catch{return freeze({status:'BLOCKED',state:'CANONICAL_JSON_INVALID'});}

 const eid=eventId(binding.manifestId,target,binding.sourceSha256);
 const event={
   eventId:eid,
   canonicalPropertyId:target.propertyId,
   eventType:'GOVERNED_SINGLE_USE_CANARY_FIELD_UPDATE',
   source:'SCIIP_EXPLORER_3_M3_24A',
   manifestId:binding.manifestId,
   changes:[{field:target.fieldName,before:clone(target.beforeValue),after:clone(target.afterValue)}]
 };
 if(!Array.isArray(corpus.events)) return freeze({status:'BLOCKED',state:'CANONICAL_EVENTS_ARRAY_MISSING'});
 corpus.events.push(event);

 const newBytes=Buffer.from(JSON.stringify(corpus,null,2)+'\n','utf8');
 const tmp=source+`.m324a-${process.pid}.tmp`;
 let writePerformed=false,rolledBack=false;
 try{
   fs.writeFileSync(tmp,newBytes,{flag:'wx'});
   fs.renameSync(tmp,source);
   writePerformed=true;

   const raw=read(source,target);
   const verified=raw.current.found&&same(raw.current.value,target.afterValue)&&raw.current.lastEventId===eid;
   if(!verified){
     fs.writeFileSync(source,beforeBytes);
     rolledBack=true;
     return freeze({status:'ROLLED_BACK',state:'READ_AFTER_WRITE_VERIFICATION_FAILED',writePerformed:true,rolledBack:true});
   }

   ledger.consumedTokens.push(singleUseToken);
   fs.mkdirSync(requireDir(tokenLedgerPath),{recursive:true});
   fs.writeFileSync(tokenLedgerPath,JSON.stringify(ledger,null,2)+'\n');

   const receipt={
     contract:'SCIIP_EXPLORER_3_M3_24A_LIVE_CANARY_RECEIPT',status:'COMMITTED_AND_VERIFIED',
     manifestId:binding.manifestId,eventId:eid,target:clone(target),
     sourceShaBefore:binding.sourceSha256,sourceShaAfter:raw.sha256,
     canonicalCommittedCount:1,tokenConsumed:true
   };
   fs.mkdirSync(requireDir(receiptPath),{recursive:true});
   fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');
   fs.mkdirSync(requireDir(auditPath),{recursive:true});
   fs.appendFileSync(auditPath,JSON.stringify({type:'M3_24A_LIVE_CANARY_COMMIT',...receipt})+'\n');

   return freeze({
    status:'PASSED',state:'EXPLICIT_GOVERNED_LIVE_CANARY_COMMITTED_AND_VERIFIED',
    preWriteVerification:pre,eventId:eid,sourceShaBefore:binding.sourceSha256,sourceShaAfter:raw.sha256,
    writePerformed:true,readAfterWriteVerified:true,rolledBack:false,tokenConsumed:true,canonicalCommitted:true,canonicalCommittedCount:1
   });
 }catch(e){
   try{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}catch{}
   if(writePerformed&&!rolledBack){try{fs.writeFileSync(source,beforeBytes);rolledBack=true;}catch{}}
   return freeze({status:'FAILED',state:'LIVE_CANARY_EXECUTION_EXCEPTION',error:String(e?.message||e),writePerformed,rolledBack});
 }
}
function requireDir(p){const i=p.lastIndexOf('/');return i>0?p.slice(0,i):'.';}
