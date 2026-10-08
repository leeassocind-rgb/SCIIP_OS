import fs from'node:fs';import path from'node:path';import crypto from'node:crypto';
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const id=(p,x)=>`${p}-${sha(x.join('|')).slice(0,16).toUpperCase()}`;
const clone=v=>JSON.parse(JSON.stringify(v));
const VOCAB=['Available','Updated Information','Price Reduced','Rate Reduced','Leased','Sold','Under Construction','Planned','Unavailable'];
const TRANS={
 'Rate Reduced':['Available','Updated Information','Price Reduced','Leased','Unavailable'],
 'Price Reduced':['Available','Updated Information','Leased','Unavailable'],
 'Available':['Updated Information','Price Reduced','Rate Reduced','Leased','Unavailable'],
 'Updated Information':['Available','Price Reduced','Rate Reduced','Leased','Unavailable'],
 'Under Construction':['Available','Updated Information','Unavailable'],
 'Planned':['Under Construction','Available','Unavailable'],
 'Leased':['Available','Updated Information','Unavailable'],
 'Sold':['Unavailable','Updated Information'],
 'Unavailable':['Available','Updated Information']
};

export function buildGovernedPropertySemanticGapResolutionEnrichmentTransitionCertificationRuntime(){return Object.freeze({
 contract:'SCIIP_EXPLORER_3_M3_18_GOVERNED_PROPERTY_SEMANTIC_GAP_RESOLUTION_ENRICHMENT_TRANSITION_CERTIFICATION_RUNTIME',
 version:'3.0-m3.18',status:'READY',m317EvidenceRequired:true,statusVocabularyCertificationRequired:true,
 statusTransitionCertificationRequired:true,clearHeightEnrichmentSemanticsRequired:true,groundLevelCountContractRequired:true,
 rateQuarantinePreserved:true,firstKnownValueEnrichmentAllowed:true,noWriteAuthorityIntroduced:true,canonicalMutationAllowed:false,
 installerExecutesWrite:false,certificationExecutesWrite:false,liveWriteExecuted:false,automaticCommit:false,automaticRetryAllowed:false,
 generalizedWriteAuthority:false,bulkWritesAllowed:false,multiPropertyWritesAllowed:false,persistentWriteAuthority:false,canonicalCommittedCount:0
});}

export function certifyStatusSemantics({transitions=[]}={}){
 const evaluated=transitions.map((t,i)=>{const b=t?.beforeValue,a=t?.afterValue;const bk=b===null||VOCAB.includes(b),ak=VOCAB.includes(a);
 const ok=b===null?ak:(bk&&ak&&(TRANS[b]||[]).includes(a));return Object.freeze({index:i,beforeValue:b,afterValue:a,transitionAllowed:ok,reason:ok?'STATUS_TRANSITION_CERTIFIED':(!bk?'UNKNOWN_BEFORE_STATUS':(!ak?'UNKNOWN_AFTER_STATUS':'STATUS_TRANSITION_NOT_ALLOWLISTED'))});});
 const fail=evaluated.filter(x=>!x.transitionAllowed);return Object.freeze({status:fail.length?'QUARANTINED':'CERTIFIED',state:fail.length?'STATUS_SEMANTICS_QUARANTINED':'STATUS_SEMANTICS_CERTIFIED',vocabulary:Object.freeze(VOCAB),evaluated:Object.freeze(evaluated),transitionCount:evaluated.length,failureCount:fail.length,canaryEligible:fail.length===0&&evaluated.length>0});
}

export function certifyClearHeightEnrichmentSemantics({transitions=[]}={}){
 const evaluated=transitions.map((t,i)=>{const b=t?.beforeValue,a=t?.afterValue;const target=typeof a==='number'&&Number.isFinite(a)&&a>=6&&a<=100;const first=b===null||b===undefined;const known=typeof b==='number'&&Number.isFinite(b)&&b>=6&&b<=100;const ok=target&&(first||known);return Object.freeze({index:i,beforeValue:b,afterValue:a,transitionType:first?'FIRST_KNOWN_VALUE_ENRICHMENT':'KNOWN_VALUE_UPDATE',transitionAllowed:ok,reason:ok?(first?'FIRST_KNOWN_VALUE_ENRICHMENT_CERTIFIED':'KNOWN_VALUE_UPDATE_CERTIFIED'):'CLEAR_HEIGHT_TRANSITION_INVALID'});});
 const fail=evaluated.filter(x=>!x.transitionAllowed);return Object.freeze({status:fail.length?'QUARANTINED':'CERTIFIED',state:fail.length?'CLEAR_HEIGHT_SEMANTICS_QUARANTINED':'CLEAR_HEIGHT_ENRICHMENT_SEMANTICS_CERTIFIED',semanticMeaning:'WAREHOUSE_CLEAR_HEIGHT',unit:'feet',nullableSourceAllowed:true,nullableTargetAllowed:false,firstKnownValueEnrichmentAllowed:true,plausibleRange:{min:6,max:100},evaluated:Object.freeze(evaluated),transitionCount:evaluated.length,failureCount:fail.length,canaryEligible:fail.length===0&&evaluated.length>0});
}

export function certifyGroundLevelCountContract({transitions=[]}={}){
 const evaluated=transitions.map((t,i)=>{const b=t?.beforeValue,a=t?.afterValue;const vb=b===null||b===undefined||(Number.isInteger(b)&&b>=0&&b<=1000);const va=Number.isInteger(a)&&a>=0&&a<=1000;const ok=vb&&va;return Object.freeze({index:i,beforeValue:b,afterValue:a,transitionAllowed:ok,reason:ok?'GROUND_LEVEL_COUNT_TRANSITION_CERTIFIED':'GROUND_LEVEL_COUNT_TRANSITION_INVALID'});});
 const fail=evaluated.filter(x=>!x.transitionAllowed);return Object.freeze({status:fail.length?'QUARANTINED':'CERTIFIED',state:fail.length?'GROUND_LEVEL_SEMANTICS_QUARANTINED':'GROUND_LEVEL_COUNT_SEMANTICS_CERTIFIED',semanticMeaning:'GROUND_LEVEL_DOOR_COUNT',unit:'count',nullableSourceAllowed:true,nullableTargetAllowed:false,integerRequired:true,plausibleRange:{min:0,max:1000},evaluated:Object.freeze(evaluated),transitionCount:evaluated.length,failureCount:fail.length,canaryEligible:fail.length===0&&evaluated.length>0});
}

export function resolveSemanticGaps({transitionProfile={}}={}){
 if(transitionProfile?.status!=='PROFILED')return Object.freeze({status:'BLOCKED',state:'M3_17_TRANSITION_PROFILE_NOT_READY'});
 const by=new Map((transitionProfile.fields||[]).map(f=>[f.fieldName,f]));
 const s=certifyStatusSemantics({transitions:by.get('status')?.transitions||[]});
 const c=certifyClearHeightEnrichmentSemantics({transitions:by.get('clearHeight')?.transitions||[]});
 const g=certifyGroundLevelCountContract({transitions:by.get('groundLevel')?.transitions||[]});
 const newly=[s.canaryEligible?'status':null,c.canaryEligible?'clearHeight':null,g.canaryEligible?'groundLevel':null].filter(Boolean);
 return Object.freeze({status:'CERTIFIED',state:'PROPERTY_SEMANTIC_GAPS_RESOLVED',resolutionId:id('G3GR',[transitionProfile.profileId,JSON.stringify(s),JSON.stringify(c),JSON.stringify(g)]),statusCertification:s,clearHeightCertification:c,groundLevelCertification:g,rateQuarantine:{preserved:true,fieldName:'rate',reason:'MIXED_MAGNITUDE_RATE_SEMANTICS_UNRESOLVED'},newlyEligibleFields:Object.freeze(newly),newlyEligibleCount:newly.length,readOnly:true,canonicalMutationAllowed:false});
}

export function buildExpandedCertifiedFieldManifest({m317FieldCertification={},gapResolution={}}={}){
 if(m317FieldCertification?.status!=='CERTIFIED'||gapResolution?.status!=='CERTIFIED')return Object.freeze({status:'BLOCKED',state:'M3_18_EXPANDED_MANIFEST_PREREQUISITES_MISSING'});
 const seen=new Set(),all=[];for(const f of [...(m317FieldCertification.eligibleFields||[]),...(gapResolution.newlyEligibleFields||[])])if(!seen.has(f)){seen.add(f);all.push(f);}
 const q=new Set(m317FieldCertification.quarantinedFields||[]);for(const f of gapResolution.newlyEligibleFields||[])q.delete(f);q.add('rate');
 return Object.freeze({status:'CERTIFIED',state:'EXPANDED_CERTIFIED_PROPERTY_DOMAIN_FIELD_SURFACE_READY',manifestId:id('G3FM',[m317FieldCertification.certificationId,gapResolution.resolutionId,JSON.stringify(all),JSON.stringify([...q].sort())]),certifiedEligibleFields:Object.freeze(all.map(f=>({fieldName:f,source:(gapResolution.newlyEligibleFields||[]).includes(f)?'M3.18':'M3.17',certificationState:'CERTIFIED'}))),certifiedEligibleCount:all.length,quarantinedFields:Object.freeze([...q].sort()),rateQuarantinePreserved:true,readOnly:true,canonicalMutationAllowed:false,liveWriteExecuted:false,mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0});
}

export function buildM318Evidence({gapResolution,expandedManifest}={}){
 if(gapResolution?.status!=='CERTIFIED'||expandedManifest?.status!=='CERTIFIED')return Object.freeze({status:'BLOCKED',state:'M3_18_EVIDENCE_NOT_READY'});
 return Object.freeze({contract:'SCIIP_EXPLORER_3_M3_18_PROPERTY_SEMANTIC_GAP_RESOLUTION_EVIDENCE',version:'3.0-m3.18',status:'CERTIFIED',state:'PROPERTY_SEMANTIC_GAP_RESOLUTION_EVIDENCE_CERTIFIED',evidenceId:id('G3EV',[gapResolution.resolutionId,expandedManifest.manifestId]),gapResolution:clone(gapResolution),expandedManifest:clone(expandedManifest),immutable:true,readOnly:true,canonicalMutationAllowed:false,liveWriteExecuted:false,mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0,automaticCommit:false,automaticRetryAllowed:false,generalizedWriteAuthority:false,bulkWritesAllowed:false,multiPropertyWritesAllowed:false,persistentWriteAuthority:false});
}

export function persistM318Evidence({evidence,outputPath}={}){
 if(evidence?.status!=='CERTIFIED')return Object.freeze({status:'BLOCKED',state:'UNCERTIFIED_M3_18_EVIDENCE_NOT_PERSISTED'});
 const t=path.resolve(outputPath);fs.mkdirSync(path.dirname(t),{recursive:true});const body=JSON.stringify(evidence,null,2)+'\n';fs.writeFileSync(t,body,{flag:'w',mode:0o444});return Object.freeze({status:'PERSISTED',state:'M3_18_EVIDENCE_PERSISTED',outputPath:t,sha256:sha(body)});
}
