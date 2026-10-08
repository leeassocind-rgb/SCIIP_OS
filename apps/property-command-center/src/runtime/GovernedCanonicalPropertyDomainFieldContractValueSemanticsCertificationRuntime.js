// SCIIP Explorer 3.0 — M3.17
// Governed Canonical Property-Domain Field Contract & Value Semantics Certification Runtime

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>JSON.parse(JSON.stringify(v));
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
function id(parts,p='G317'){return `${p}-${sha(parts.join('|')).slice(0,16).toUpperCase()}`;}

const FIELD_POLICIES=Object.freeze({
  availableSf:Object.freeze({
    semanticMeaning:'AVAILABLE_BUILDING_AREA',
    unit:'square_feet',
    allowedTypes:['number'],
    nullable:false,
    min:0,
    max:100000000,
    integerPreferred:true,
    canaryEligibility:'ELIGIBLE_IF_TRANSITION_VALID'
  }),
  clearHeight:Object.freeze({
    semanticMeaning:'WAREHOUSE_CLEAR_HEIGHT',
    unit:'feet',
    allowedTypes:['number'],
    nullable:false,
    min:6,
    max:100,
    integerPreferred:false,
    canaryEligibility:'ELIGIBLE_IF_TRANSITION_VALID'
  }),
  powerAmps:Object.freeze({
    semanticMeaning:'ELECTRICAL_SERVICE_CAPACITY',
    unit:'amps',
    allowedTypes:['number','null'],
    nullable:true,
    min:0,
    max:100000,
    integerPreferred:true,
    canaryEligibility:'ELIGIBLE_NON_NULL_TARGET_ONLY'
  }),
  dockHigh:Object.freeze({
    semanticMeaning:'DOCK_HIGH_POSITION_COUNT',
    unit:'count',
    allowedTypes:['number'],
    nullable:false,
    min:0,
    max:10000,
    integerPreferred:true,
    canaryEligibility:'ELIGIBLE_IF_TRANSITION_VALID'
  }),
  rate:Object.freeze({
    semanticMeaning:'UNRESOLVED_RATE_SEMANTICS',
    unit:'UNRESOLVED',
    allowedTypes:['number','null'],
    nullable:true,
    min:null,
    max:null,
    integerPreferred:false,
    canaryEligibility:'QUARANTINED'
  })
});

export function buildGovernedCanonicalPropertyDomainFieldContractValueSemanticsCertificationRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_17_GOVERNED_CANONICAL_PROPERTY_DOMAIN_FIELD_CONTRACT_VALUE_SEMANTICS_CERTIFICATION_RUNTIME',
    version:'3.0-m3.17',
    status:'READY',
    m316EvidenceRequired:true,
    observedProductionTransitionsRequired:true,
    fieldContractRequired:true,
    typeCertificationRequired:true,
    unitCertificationRequired:true,
    rangeCertificationRequired:true,
    nullabilityCertificationRequired:true,
    transitionValidityRequired:true,
    semanticMeaningRequired:true,
    canaryEligibilityCertificationRequired:true,
    ambiguousFieldQuarantineRequired:true,
    rateFieldQuarantined:true,
    noWriteAuthorityIntroduced:true,
    canonicalMutationAllowed:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    liveWriteExecuted:false,
    automaticCommit:false,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    canonicalCommittedCount:0
  });
}

function valueType(v){return v===null?'null':Array.isArray(v)?'array':typeof v;}

export function profileObservedFieldTransitions({decodedChanges=[]}={}){
  if(!Array.isArray(decodedChanges))
    return Object.freeze({status:'BLOCKED',state:'DECODED_CHANGES_NOT_ARRAY'});

  const fields=new Map();

  for(const change of decodedChanges){
    const fieldName=clean(change?.fieldName);
    if(fieldName==='UNAVAILABLE') continue;

    if(!fields.has(fieldName)){
      fields.set(fieldName,{
        fieldName,
        transitions:[],
        observedTypes:new Set(),
        beforeTypes:new Set(),
        afterTypes:new Set(),
        nullBeforeCount:0,
        nullAfterCount:0
      });
    }

    const f=fields.get(fieldName);
    const beforeValue=change?.beforeValue;
    const afterValue=change?.afterValue;

    f.transitions.push({
      propertyId:clean(change?.propertyId),
      beforeValue,
      afterValue,
      eventIndex:change?.eventIndex,
      changeIndex:change?.changeIndex
    });

    f.beforeTypes.add(valueType(beforeValue));
    f.afterTypes.add(valueType(afterValue));
    f.observedTypes.add(valueType(beforeValue));
    f.observedTypes.add(valueType(afterValue));
    if(beforeValue===null||beforeValue===undefined) f.nullBeforeCount++;
    if(afterValue===null||afterValue===undefined) f.nullAfterCount++;
  }

  const profiles=[...fields.values()].map(f=>{
    const numericValues=f.transitions
      .flatMap(t=>[t.beforeValue,t.afterValue])
      .filter(v=>typeof v==='number'&&Number.isFinite(v));

    return Object.freeze({
      fieldName:f.fieldName,
      transitionCount:f.transitions.length,
      observedTypes:[...f.observedTypes].sort(),
      beforeTypes:[...f.beforeTypes].sort(),
      afterTypes:[...f.afterTypes].sort(),
      nullBeforeCount:f.nullBeforeCount,
      nullAfterCount:f.nullAfterCount,
      observedMin:numericValues.length?Math.min(...numericValues):null,
      observedMax:numericValues.length?Math.max(...numericValues):null,
      transitions:Object.freeze(clone(f.transitions))
    });
  }).sort((a,b)=>b.transitionCount-a.transitionCount||a.fieldName.localeCompare(b.fieldName));

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_17_OBSERVED_FIELD_TRANSITION_PROFILE',
    version:'3.0-m3.17',
    status:'PROFILED',
    state:'OBSERVED_CANONICAL_FIELD_TRANSITIONS_PROFILED',
    profileId:id([JSON.stringify(profiles)],'G3TP'),
    fieldCount:profiles.length,
    fields:Object.freeze(profiles),
    readOnly:true
  });
}

function certifyAgainstPolicy(profile,policy){
  if(!policy){
    return {
      fieldName:profile.fieldName,
      status:'QUARANTINED',
      classification:'UNKNOWN_OR_UNGOVERNED_FIELD',
      reasons:['NO_CERTIFIED_FIELD_POLICY'],
      canaryEligible:false
    };
  }

  const reasons=[];
  const nonNullTypes=profile.observedTypes.filter(t=>t!=='null'&&t!=='undefined');
  const allowedTypeSet=new Set(policy.allowedTypes);

  for(const t of nonNullTypes){
    if(!allowedTypeSet.has(t)) reasons.push(`TYPE_NOT_ALLOWED:${t}`);
  }

  if(!policy.nullable && (profile.nullBeforeCount>0||profile.nullAfterCount>0)){
    reasons.push('NULL_OBSERVED_ON_NON_NULLABLE_FIELD');
  }

  if(profile.observedMin!==null && policy.min!==null && profile.observedMin<policy.min){
    reasons.push(`OBSERVED_MIN_BELOW_POLICY:${profile.observedMin}<${policy.min}`);
  }
  if(profile.observedMax!==null && policy.max!==null && profile.observedMax>policy.max){
    reasons.push(`OBSERVED_MAX_ABOVE_POLICY:${profile.observedMax}>${policy.max}`);
  }

  if(policy.integerPreferred){
    for(const t of profile.transitions){
      for(const v of [t.beforeValue,t.afterValue]){
        if(typeof v==='number'&&Number.isFinite(v)&&!Number.isInteger(v)){
          reasons.push('NON_INTEGER_VALUE_OBSERVED');
          break;
        }
      }
      if(reasons.includes('NON_INTEGER_VALUE_OBSERVED')) break;
    }
  }

  if(profile.fieldName==='rate'){
    const numeric=profile.transitions.flatMap(t=>[t.beforeValue,t.afterValue]).filter(v=>typeof v==='number'&&Number.isFinite(v));
    const hasSub10=numeric.some(v=>v>0&&v<10);
    const hasOver100=numeric.some(v=>v>100);
    if(hasSub10&&hasOver100) reasons.push('MIXED_MAGNITUDE_RATE_SEMANTICS');
  }

  const quarantined=policy.canaryEligibility==='QUARANTINED'||reasons.length>0;
  const canaryEligible=!quarantined && policy.canaryEligibility.startsWith('ELIGIBLE');

  return Object.freeze({
    fieldName:profile.fieldName,
    status:quarantined?'QUARANTINED':'CERTIFIED',
    semanticMeaning:policy.semanticMeaning,
    unit:policy.unit,
    allowedTypes:policy.allowedTypes,
    nullable:policy.nullable,
    plausibleRange:Object.freeze({min:policy.min,max:policy.max}),
    integerPreferred:policy.integerPreferred,
    observed:Object.freeze({
      transitionCount:profile.transitionCount,
      observedTypes:profile.observedTypes,
      nullBeforeCount:profile.nullBeforeCount,
      nullAfterCount:profile.nullAfterCount,
      observedMin:profile.observedMin,
      observedMax:profile.observedMax
    }),
    transitionValidity:reasons.length===0,
    reasons:Object.freeze([...new Set(reasons)]),
    canaryEligibilityPolicy:policy.canaryEligibility,
    canaryEligible
  });
}

export function certifyPropertyDomainFieldContracts({transitionProfile={}}={}){
  if(transitionProfile?.status!=='PROFILED')
    return Object.freeze({status:'BLOCKED',state:'TRANSITION_PROFILE_NOT_READY'});

  const contracts=transitionProfile.fields.map(profile=>
    certifyAgainstPolicy(profile,FIELD_POLICIES[profile.fieldName])
  );

  const certified=contracts.filter(x=>x.status==='CERTIFIED');
  const quarantined=contracts.filter(x=>x.status==='QUARANTINED');
  const eligible=contracts.filter(x=>x.canaryEligible===true);

  const rateContract=contracts.find(x=>x.fieldName==='rate')||null;
  const rateQuarantined=!rateContract||rateContract.status==='QUARANTINED';

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_17_PROPERTY_DOMAIN_FIELD_CONTRACT_CERTIFICATION',
    version:'3.0-m3.17',
    status:'CERTIFIED',
    state:'PROPERTY_DOMAIN_FIELD_CONTRACTS_CERTIFIED',
    certificationId:id([
      transitionProfile.profileId,
      JSON.stringify(contracts)
    ],'G3FC'),
    contracts:Object.freeze(contracts),
    certifiedCount:certified.length,
    quarantinedCount:quarantined.length,
    eligibleCount:eligible.length,
    eligibleFields:Object.freeze(eligible.map(x=>x.fieldName)),
    quarantinedFields:Object.freeze(quarantined.map(x=>x.fieldName)),
    rateQuarantined,
    readOnly:true,
    canonicalMutationAllowed:false
  });
}

export function buildM317CanaryEligibilityManifest({fieldCertification={}}={}){
  if(fieldCertification?.status!=='CERTIFIED')
    return Object.freeze({status:'BLOCKED',state:'FIELD_CERTIFICATION_NOT_READY'});

  const eligibleContracts=fieldCertification.contracts.filter(x=>x.canaryEligible===true);
  const quarantinedContracts=fieldCertification.contracts.filter(x=>x.status==='QUARANTINED');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_17_CANARY_ELIGIBILITY_MANIFEST',
    version:'3.0-m3.17',
    status:'CERTIFIED',
    state:eligibleContracts.length
      ?'CERTIFIED_PROPERTY_DOMAIN_CANARY_FIELDS_AVAILABLE'
      :'NO_CERTIFIED_PROPERTY_DOMAIN_CANARY_FIELDS',
    manifestId:id([
      fieldCertification.certificationId,
      JSON.stringify(eligibleContracts),
      JSON.stringify(quarantinedContracts)
    ],'G3CM'),
    eligibleFields:Object.freeze(eligibleContracts.map(x=>Object.freeze({
      fieldName:x.fieldName,
      semanticMeaning:x.semanticMeaning,
      unit:x.unit,
      nullable:x.nullable,
      plausibleRange:x.plausibleRange,
      canaryEligibilityPolicy:x.canaryEligibilityPolicy
    }))),
    quarantinedFields:Object.freeze(quarantinedContracts.map(x=>Object.freeze({
      fieldName:x.fieldName,
      reasons:x.reasons,
      semanticMeaning:x.semanticMeaning||'UNKNOWN'
    }))),
    explicitNoCertifiedCanaryFields:eligibleContracts.length===0,
    readOnly:true,
    canonicalMutationAllowed:false,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });
}

export function buildM317Evidence({transitionProfile,fieldCertification,eligibilityManifest}={}){
  if(transitionProfile?.status!=='PROFILED'||
     fieldCertification?.status!=='CERTIFIED'||
     eligibilityManifest?.status!=='CERTIFIED')
    return Object.freeze({status:'BLOCKED',state:'M3_17_EVIDENCE_NOT_READY'});

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_17_FIELD_CONTRACT_VALUE_SEMANTICS_EVIDENCE',
    version:'3.0-m3.17',
    status:'CERTIFIED',
    state:'PROPERTY_DOMAIN_FIELD_CONTRACT_VALUE_SEMANTICS_EVIDENCE_CERTIFIED',
    evidenceId:id([
      transitionProfile.profileId,
      fieldCertification.certificationId,
      eligibilityManifest.manifestId
    ],'G3EV'),
    transitionProfile:Object.freeze(clone(transitionProfile)),
    fieldCertification:Object.freeze(clone(fieldCertification)),
    eligibilityManifest:Object.freeze(clone(eligibilityManifest)),
    immutable:true,
    readOnly:true,
    canonicalMutationAllowed:false,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0,
    automaticCommit:false,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false
  });
}

export function persistM317Evidence({evidence,outputPath}={}){
  if(evidence?.status!=='CERTIFIED')
    return Object.freeze({status:'BLOCKED',state:'UNCERTIFIED_M3_17_EVIDENCE_NOT_PERSISTED'});

  const target=path.resolve(outputPath);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const body=JSON.stringify(evidence,null,2)+'\n';
  fs.writeFileSync(target,body,{flag:'w',mode:0o444});

  return Object.freeze({
    status:'PERSISTED',
    state:'M3_17_EVIDENCE_PERSISTED',
    outputPath:target,
    sha256:sha(body)
  });
}
