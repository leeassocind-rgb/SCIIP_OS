import{buildIntelligenceQualityModel}from'./IntelligenceQualityModel.js';
import{buildGovernedPropertyState}from'./GovernedPropertyState.js';
import{applyCanonicalFieldCoverage}from'./CanonicalFieldCoverage.js';
import{alignCanonicalRuntimeFields,assertNoKnownCanonicalMissing}from'./CanonicalRuntimeSourceAlignment.js';
import{alignCanonicalRuntimeTrace,certifyClearHeightInvariant}from'./CanonicalSourceTrace.js';
import{alignFieldsWithCanonicalMetricSelector,certifyMetricGapConsistency}from'./CanonicalMetricSelector.js';
import{resolveCanonicalPropertyField,resolveCanonicalPropertyFields,certifyCanonicalRuntimeInvariant}from'./CanonicalPropertyFieldResolver.js';

function freeze(v){return Object.freeze(v);}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null;}
function text(v){return String(v??'').trim();}

const FIELD_POLICY={
  parcelId:{label:'Parcel ID',priority:100,source:'County Assessor / LightBox',reason:'Identity anchor for parcel-level verification'},
  buildingSf:{label:'Building SF',priority:95,source:'SCIIP SuperSheet / Broker Record',reason:'Core industrial underwriting metric'},
  landAcres:{label:'Land Area',priority:92,source:'County Assessor / LightBox',reason:'Core site and coverage metric'},
  clearHeight:{label:'Clear Height',priority:90,source:'Broker Survey / Listing Brochure',reason:'Critical industrial suitability attribute'},
  powerAmps:{label:'Power',priority:98,source:'Utility / Broker Verification',reason:'Critical manufacturing and advanced-industry suitability attribute'},
  propertyType:{label:'Property Type',priority:80,source:'SCIIP + LightBox Corroboration',reason:'Classification affects comps, demand, and use fit'},
  landUse:{label:'Land Use',priority:78,source:'County / LightBox',reason:'Use classification affects site suitability and entitlement interpretation'},
  askingRate:{label:'Asking Rate',priority:88,source:'Broker Market Intelligence / Listing',reason:'Critical for current availability and market positioning'},
  leaseCompRate:{label:'Lease Comp Rate',priority:86,source:'SCIIP Comp SuperSheet',reason:'Critical for market pricing and negotiation context'},
  assessedTotal:{label:'Assessed Value',priority:45,source:'County Assessor / LightBox',reason:'Useful ownership and tax context'},
  ownership:{label:'Ownership',priority:72,source:'County / LightBox / Broker Record',reason:'Supports prospecting and transaction context'},
  zoning:{label:'Zoning',priority:82,source:'Municipal GIS / Planning',reason:'Critical for use compatibility and development constraints'},
  yearBuilt:{label:'Year Built',priority:55,source:'County Assessor / LightBox',reason:'Supports building quality and vintage analysis'}
};

function fieldPolicy(key){
  return FIELD_POLICY[key]||{label:key,priority:50,source:'Broker Verification',reason:'Unresolved property intelligence'};
}

function stale(field){
  const stamp=field?.observedAt||field?.updatedAt||field?.asOfDate||null;
  if(!stamp)return false;
  const ms=Date.parse(stamp);
  if(!Number.isFinite(ms))return false;
  const ageDays=(Date.now()-ms)/86400000;
  return ageDays>365;
}

function missingCanonical(field){
  const v=field?.effectiveCanonicalValue;
  return v===null||v===undefined||v==='';
}

function missingExternal(field){
  const v=field?.externalValue;
  return v===null||v===undefined||v==='';
}

function gapType(field,lifecycle){
  if(field?.effectiveAgreementState==='REVIEW')return'CONFLICT';
  if(lifecycle?.state==='PROPOSED'||lifecycle?.state==='APPROVED')return'GOVERNANCE_REQUIRED';
  if(stale(field))return'STALE';
  if(missingCanonical(field)&&missingExternal(field))return'MISSING';
  if(missingCanonical(field)&&!missingExternal(field))return'ENRICHMENT_AVAILABLE';
  return null;
}

function severity(type,basePriority){
  let modifier=0;
  if(type==='CONFLICT')modifier=15;
  else if(type==='MISSING')modifier=10;
  else if(type==='GOVERNANCE_REQUIRED')modifier=8;
  else if(type==='STALE')modifier=5;
  else if(type==='ENRICHMENT_AVAILABLE')modifier=3;
  const score=Math.max(0,Math.min(100,basePriority+modifier));
  return score>=90?'CRITICAL':score>=75?'HIGH':score>=55?'MEDIUM':'LOW';
}

function actionFor(type,policy){
  if(type==='CONFLICT')return`Resolve conflicting ${policy.label} evidence before relying on this field.`;
  if(type==='GOVERNANCE_REQUIRED')return`Complete governed review for ${policy.label}.`;
  if(type==='STALE')return`Refresh ${policy.label} from ${policy.source}.`;
  if(type==='ENRICHMENT_AVAILABLE')return`Review verified external ${policy.label} and promote if appropriate.`;
  return`Acquire ${policy.label} from ${policy.source}.`;
}

// M2.21g.2: canonical runtime registry bridge active
export function buildIntelligenceGapEngine(property,model){
  const quality=buildIntelligenceQualityModel(property,model);
  const governed=buildGovernedPropertyState(property,model);
  const lifecycleMap=new Map((governed.lifecycle?.fields||[]).map(x=>[x.fieldKey,x]));
  const resolvedFields=resolveCanonicalPropertyFields(property,model,governed.reconciled?.fields||[]);
  const fields=resolvedFields.map(field=>{
    const resolved=resolveCanonicalPropertyField(property,model,field.key);
    if(!resolved?.found)return field;
    return freeze({...field,effectiveCanonicalValue:resolved.value,canonicalKnown:true,canonicalFieldResolution:resolved});
  });

  const gaps=fields.map(field=>{
    const type=gapType(field,lifecycleMap.get(field.key));
    if(!type)return null;
    const policy=fieldPolicy(field.key);
    const priorityScore=Math.max(0,Math.min(100,
      policy.priority+
      (type==='CONFLICT'?15:type==='MISSING'?10:type==='GOVERNANCE_REQUIRED'?8:type==='STALE'?5:3)
    ));
    return freeze({
      fieldKey:field.key,
      label:policy.label,
      type,
      severity:severity(type,policy.priority),
      priorityScore,
      canonicalValue:field.effectiveCanonicalValue??null,
      externalValue:field.externalValue??null,
      recommendedSource:policy.source,
      businessReason:policy.reason,
      recommendedAction:actionFor(type,policy),
      lifecycleState:lifecycleMap.get(field.key)?.state||'UNRESOLVED'
    });
  }).filter(Boolean).sort((a,b)=>b.priorityScore-a.priorityScore);

  const canonicalRuntimeInvariant=certifyCanonicalRuntimeInvariant({
    property,
    model,
    fields,
    gaps
  });
  if(!canonicalRuntimeInvariant.valid){
    throw new Error(`CANONICAL_RUNTIME_INVARIANT_VIOLATION:${JSON.stringify(canonicalRuntimeInvariant.violations)}`);
  }

  const metricConsistency=certifyMetricGapConsistency(
    property,
    model,
    fields,
    gaps,
    model?.propertyMetrics||model?.metrics||model?.specs||model?.snapshot||null
  );
  if(!metricConsistency.valid){
    throw new Error(`CANONICAL_METRIC_GAP_CONSISTENCY_VIOLATION:${JSON.stringify(metricConsistency.violations)}`);
  }

  const clearHeightInvariant=certifyClearHeightInvariant(property,model,fields,gaps);
  if(!clearHeightInvariant.valid){
    throw new Error(`CLEAR_HEIGHT_CANONICAL_TRACE_INVARIANT_VIOLATION:${clearHeightInvariant.canonicalValue}:${clearHeightInvariant.trace.source}:${clearHeightInvariant.trace.path}`);
  }

  const invariant=assertNoKnownCanonicalMissing(gaps,fields);
  if(!invariant.valid){
    throw new Error(`CANONICAL_RUNTIME_GAP_INVARIANT_VIOLATION:${invariant.violations.join(',')}`);
  }

  const top=gaps[0]||null;

  return freeze({
    status:'ACTIVE',
    propertyId:quality.propertyId,
    quality,
    gaps:freeze(gaps),
    topPriorityGap:top,
    counts:freeze({
      total:gaps.length,
      critical:gaps.filter(x=>x.severity==='CRITICAL').length,
      high:gaps.filter(x=>x.severity==='HIGH').length,
      medium:gaps.filter(x=>x.severity==='MEDIUM').length,
      low:gaps.filter(x=>x.severity==='LOW').length,
      missing:gaps.filter(x=>x.type==='MISSING').length,
      stale:gaps.filter(x=>x.type==='STALE').length,
      conflicts:gaps.filter(x=>x.type==='CONFLICT').length,
      governanceRequired:gaps.filter(x=>x.type==='GOVERNANCE_REQUIRED').length,
      enrichmentAvailable:gaps.filter(x=>x.type==='ENRICHMENT_AVAILABLE').length
    }),
    nextBestAction:top?.recommendedAction||'No material intelligence gaps detected.',
    acquisitionMode:'GOVERNED_RECOMMENDATION_ONLY',
    automaticExternalWrites:false
  });
}
