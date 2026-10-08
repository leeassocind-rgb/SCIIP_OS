// SCIIP Explorer 3.0 — M3.22
// Governed Fresh Canary Intent Construction & Non-Historical Mutation Qualification Runtime

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>JSON.parse(JSON.stringify(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>Object.freeze(v);

const FIELD_POLICIES=Object.freeze({
  availableSf:Object.freeze({
    type:'number',min:0,max:100000000,
    mutationMode:'DECREMENT_SMALL_PCT',
    maxDeltaPct:0.05,
    semantic:'AVAILABLE_BUILDING_AREA'
  }),
  powerAmps:Object.freeze({
    type:'number',min:0,max:100000,
    mutationMode:'DECREMENT_SMALL_PCT',
    maxDeltaPct:0.05,
    semantic:'ELECTRICAL_SERVICE_CAPACITY'
  }),
  dockHigh:Object.freeze({
    type:'integer',min:0,max:10000,
    mutationMode:'DECREMENT_ONE',
    semantic:'DOCK_HIGH_POSITION_COUNT'
  }),
  clearHeight:Object.freeze({
    type:'number',min:6,max:100,
    mutationMode:'NO_SYNTHETIC_MUTATION',
    semantic:'WAREHOUSE_CLEAR_HEIGHT'
  }),
  groundLevel:Object.freeze({
    type:'integer',min:0,max:1000,
    mutationMode:'DECREMENT_ONE',
    semantic:'GROUND_LEVEL_DOOR_COUNT'
  }),
  status:Object.freeze({
    type:'string',
    mutationMode:'NO_SYNTHETIC_MUTATION',
    semantic:'PROPERTY_MARKET_STATUS'
  })
});

export function buildM322Runtime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_22_GOVERNED_FRESH_CANARY_INTENT_CONSTRUCTION_NON_HISTORICAL_MUTATION_QUALIFICATION_RUNTIME',
    version:'3.0-m3.22',
    status:'READY',
    m321EvidenceRequired:true,
    authoritativeCurrentStateRequired:true,
    nonHistoricalIntentRequired:true,
    exactOneIntentRequired:true,
    boundedMutationRequired:true,
    duplicateTransitionProofRequired:true,
    invariantValidationRequired:true,
    rollbackMaterialRequired:true,
    finalReadBeforePreauthorizationRequired:true,
    singleUsePreauthorizationRequired:true,
    liveMutationAllowed:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    automaticCommit:false,
    automaticRetry:false,
    generalizedWriteAuthority:false,
    bulkWrites:false,
    multiPropertyWrites:false,
    persistentWriteAuthority:false,
    canonicalCommittedCountAtInstall:0
  });
}

function eventPropertyId(e){return e?.canonicalPropertyId??e?.propertyId??e?.canonical_property_id??e?.property_id??null;}
function changes(e){return Array.isArray(e?.changes)?e.changes:[];}

export function projectAuthoritativeCurrentState({corpus}={}){
  const events=Array.isArray(corpus?.events)?corpus.events:[];
  const current={};
  const lineage=[];
  events.forEach((e,i)=>{
    const pid=eventPropertyId(e); if(!pid)return;
    current[pid] ||= {};
    for(const c of changes(e)){
      if(!c?.field)continue;
      current[pid][c.field]=clone(c.after);
      lineage.push({
        propertyId:pid,fieldName:c.field,beforeValue:clone(c.before),afterValue:clone(c.after),
        eventIndex:i,eventId:clean(e?.eventId||`event-${i}`),eventType:clean(e?.eventType)
      });
    }
  });
  return freeze({
    status:'PROJECTED',
    state:'AUTHORITATIVE_CURRENT_STATE_PROJECTED',
    propertyCount:Object.keys(current).length,
    transitionCount:lineage.length,
    currentState:freeze(current),
    lineage:freeze(lineage)
  });
}

function fieldRiskScore(field){
  return {availableSf:10,powerAmps:20,dockHigh:30,groundLevel:40,clearHeight:90,status:100}[field]??999;
}

function proposeValue(field,current){
  const p=FIELD_POLICIES[field];
  if(!p)return {ok:false,reason:'NO_FIELD_POLICY'};
  if(p.mutationMode==='NO_SYNTHETIC_MUTATION')return {ok:false,reason:'FIELD_NOT_APPROVED_FOR_SYNTHETIC_CANARY'};
  if(p.type==='number'&&typeof current!=='number')return {ok:false,reason:'CURRENT_VALUE_TYPE_INVALID'};
  if(p.type==='integer'&&!Number.isInteger(current))return {ok:false,reason:'CURRENT_VALUE_TYPE_INVALID'};

  let proposed=current;
  if(p.mutationMode==='DECREMENT_SMALL_PCT'){
    const delta=Math.max(1,Math.round(Math.abs(current)*0.01));
    proposed=current-delta;
  }else if(p.mutationMode==='DECREMENT_ONE'){
    proposed=current-1;
  }

  if(typeof proposed==='number'&&(proposed<p.min||proposed>p.max))return {ok:false,reason:'PROPOSED_VALUE_OUT_OF_RANGE'};
  if(same(current,proposed))return {ok:false,reason:'NO_OP_PROPOSAL'};

  const delta=Math.abs(Number(proposed)-Number(current));
  const deltaPct=current===0?null:delta/Math.abs(Number(current));
  if(p.maxDeltaPct!==undefined&&deltaPct!==null&&deltaPct>p.maxDeltaPct){
    return {ok:false,reason:'PROPOSED_DELTA_EXCEEDS_POLICY'};
  }

  return {
    ok:true,
    proposedValue:proposed,
    delta,
    deltaPct,
    policy:p
  };
}

function transitionExists(lineage,propertyId,fieldName,beforeValue,afterValue){
  return lineage.some(x=>
    x.propertyId===propertyId &&
    x.fieldName===fieldName &&
    same(x.beforeValue,beforeValue) &&
    same(x.afterValue,afterValue)
  );
}

export function constructFreshCanaryIntents({
  projection,
  certifiedFields=['availableSf','powerAmps','dockHigh','groundLevel'],
  maxCandidates=100
}={}){
  if(projection?.status!=='PROJECTED')return freeze({status:'BLOCKED',state:'CURRENT_STATE_NOT_PROJECTED'});
  const intents=[];

  const propertyIds=Object.keys(projection.currentState||{}).sort();
  for(const propertyId of propertyIds){
    const fields=projection.currentState[propertyId]||{};
    for(const fieldName of certifiedFields){
      if(!(fieldName in fields))continue;
      const currentValue=fields[fieldName];
      const proposal=proposeValue(fieldName,currentValue);
      if(!proposal.ok)continue;
      if(transitionExists(projection.lineage,propertyId,fieldName,currentValue,proposal.proposedValue))continue;

      const candidateId=`G322C-${sha([
        propertyId,fieldName,JSON.stringify(currentValue),JSON.stringify(proposal.proposedValue)
      ].join('|')).slice(0,16).toUpperCase()}`;

      intents.push(freeze({
        candidateId,
        propertyId,
        fieldName,
        currentValue:clone(currentValue),
        proposedValue:clone(proposal.proposedValue),
        delta:proposal.delta,
        deltaPct:proposal.deltaPct,
        semantic:proposal.policy.semantic,
        mutationMode:proposal.policy.mutationMode,
        historicalTransitionAlreadyExists:false,
        boundedMutation:true,
        rollbackValue:clone(currentValue),
        riskScore:fieldRiskScore(fieldName)
      }));
      if(intents.length>=maxCandidates)break;
    }
    if(intents.length>=maxCandidates)break;
  }

  intents.sort((a,b)=>
    a.riskScore-b.riskScore ||
    a.propertyId.localeCompare(b.propertyId) ||
    a.fieldName.localeCompare(b.fieldName)
  );

  return freeze({
    status:'CONSTRUCTED',
    state:intents.length?'FRESH_NON_HISTORICAL_CANARY_INTENTS_CONSTRUCTED':'NO_FRESH_NON_HISTORICAL_CANARY_INTENT_AVAILABLE',
    intentCount:intents.length,
    intents:freeze(intents)
  });
}

export function qualifyFreshCanaryIntents({construction}={}){
  if(construction?.status!=='CONSTRUCTED')return freeze({status:'BLOCKED',state:'INTENT_CONSTRUCTION_NOT_READY'});
  const qualified=[];
  for(const i of construction.intents||[]){
    const p=FIELD_POLICIES[i.fieldName];
    if(!p)continue;

    const typeOk=
      p.type==='number'?typeof i.proposedValue==='number':
      p.type==='integer'?Number.isInteger(i.proposedValue):
      p.type==='string'?typeof i.proposedValue==='string':false;

    const rangeOk=typeof i.proposedValue!=='number'||(
      (p.min===undefined||i.proposedValue>=p.min) &&
      (p.max===undefined||i.proposedValue<=p.max)
    );
    const rollbackReady=i.rollbackValue!==undefined;
    const nonHistorical=i.historicalTransitionAlreadyExists===false;
    const bounded=i.boundedMutation===true;

    if(typeOk&&rangeOk&&rollbackReady&&nonHistorical&&bounded){
      qualified.push(freeze({
        ...i,
        typeInvariant:true,
        rangeInvariant:true,
        rollbackReady:true,
        nonHistorical:true,
        qualificationHash:sha(JSON.stringify(i))
      }));
    }
  }

  return freeze({
    status:'QUALIFIED',
    state:qualified.length?'FRESH_NON_HISTORICAL_CANARY_INTENTS_QUALIFIED':'NO_QUALIFIED_FRESH_CANARY_INTENTS',
    qualifiedCount:qualified.length,
    qualified:freeze(qualified)
  });
}

export function selectExactlyOneFreshIntent({qualification}={}){
  const q=qualification?.qualified||[];
  if(!q.length)return freeze({status:'BLOCKED',state:'NO_QUALIFIED_FRESH_CANARY_INTENT',selectedIntent:null});
  const selected=q[0];
  return freeze({
    status:'CERTIFIED',
    state:'EXACTLY_ONE_FRESH_CANARY_INTENT_SELECTED',
    candidatePoolSize:q.length,
    selectedIntent:selected,
    deterministicSelection:true
  });
}

export function finalReadFreshIntent({sourcePath,selection}={}){
  if(selection?.status!=='CERTIFIED')return freeze({status:'BLOCKED',state:'SELECTION_NOT_CERTIFIED'});
  let corpus;try{corpus=JSON.parse(fs.readFileSync(sourcePath,'utf8'));}catch(e){return freeze({status:'BLOCKED',state:'FINAL_READ_FAILED',error:e.message});}
  const projection=projectAuthoritativeCurrentState({corpus});
  const s=selection.selectedIntent;
  const observed=projection.currentState?.[s.propertyId]?.[s.fieldName];
  const exact=same(observed,s.currentValue);

  return freeze({
    status:exact?'CERTIFIED':'BLOCKED',
    state:exact?'FINAL_AUTHORITATIVE_CURRENT_STATE_CONFIRMED':'AUTHORITATIVE_CURRENT_STATE_DRIFTED',
    propertyId:s.propertyId,
    fieldName:s.fieldName,
    expectedCurrentValue:clone(s.currentValue),
    observedCurrentValue:clone(observed),
    exactReadConsistency:exact,
    sourceSha256:sha(fs.readFileSync(sourcePath))
  });
}

export function buildFreshIntentPreauthorizationManifest({sourceResolution,selection,finalRead}={}){
  const ok=sourceResolution?.status==='CERTIFIED'&&selection?.status==='CERTIFIED'&&finalRead?.status==='CERTIFIED';
  const s=selection?.selectedIntent||{};
  const manifestId=`G322M-${sha([
    clean(s.candidateId),
    clean(sourceResolution?.sha256),
    clean(finalRead?.sourceSha256),
    JSON.stringify(s.currentValue),
    JSON.stringify(s.proposedValue)
  ].join('|')).slice(0,16).toUpperCase()}`;
  const token=sha(`${manifestId}|M3.23|SINGLE_USE`);

  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_22_FRESH_CANARY_INTENT_PREAUTHORIZATION_MANIFEST',
    version:'3.0-m3.22',
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'FRESH_NON_HISTORICAL_CANARY_INTENT_PREAUTHORIZED_FOR_SEPARATE_EXECUTION':'FRESH_CANARY_INTENT_PREAUTHORIZATION_BLOCKED',
    manifestId,
    singleUseToken:ok?token:null,
    singleUseOnly:true,
    target:ok?{
      propertyId:s.propertyId,
      fieldName:s.fieldName,
      beforeValue:clone(s.currentValue),
      afterValue:clone(s.proposedValue),
      rollbackValue:clone(s.rollbackValue),
      candidateId:s.candidateId,
      qualificationHash:s.qualificationHash
    }:null,
    authoritativeSource:sourceResolution?.source||null,
    authoritativeSourceSha256:sourceResolution?.sha256||null,
    finalReadConsistency:finalRead?.exactReadConsistency===true,
    liveWriteAuthorized:false,
    separateExecutionMilestoneRequired:'M3.23',
    writeExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });
}
