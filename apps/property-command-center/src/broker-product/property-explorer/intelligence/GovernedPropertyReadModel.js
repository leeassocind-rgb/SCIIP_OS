// SCIIP Explorer 3.0 — M2.27
// Governed Property Read Model / Canonical Consumption Layer
//
// One authoritative read interface over:
//   immutable/base property record
//   + active governed canonical overlays
//   + M2.26 property command state
//
// This module NEVER mutates the supplied property or any source record.

import{
  activeCanonicalOverlays,
  applyCanonicalOverlays
}from'./GovernedCanonicalPromotionExecution.js';
import{buildGovernedPropertyCommandState}from'./GovernedPropertyCommandState.js';

const freeze=x=>Object.freeze(x);
const keyOf=p=>String(
  p?.id||p?.propertyId||p?.canonicalPropertyId||
  p?.parcelId||p?.apn||p?.address||'UNKNOWN_PROPERTY'
);

const aliases=Object.freeze({
  landUse:['landUse','canonicalLandUse'],
  assessedTotal:['assessedTotal','assessedValue','canonicalAssessedTotal'],
  propertyType:['propertyType','canonicalPropertyType'],
  clearHeight:['clearHeight','clearHeightFt']
});

function baseValue(property,fieldKey){
  const keys=aliases[fieldKey]||[fieldKey];
  for(const key of keys){
    const value=property?.[key];
    if(value!==undefined&&value!==null&&value!=='')return value;
  }
  return null;
}

export function buildGovernedPropertyReadModel(property,model=null){
  if(!property||typeof property!=='object'){
    return freeze({
      status:'NO_PROPERTY',
      property:null,
      baseProperty:property??null,
      propertyKey:null,
      overlays:freeze([]),
      fieldState:freeze({}),
      commandState:null,
      invariants:freeze({
        baseMutation:false,
        directWrite:false,
        readOnly:true
      })
    });
  }

  const overlaysByField=activeCanonicalOverlays(property);
  const effectiveProperty=applyCanonicalOverlays(property);
  const overlays=Object.values(overlaysByField);

  const fieldKeys=new Set([
    ...Object.keys(aliases),
    ...Object.keys(overlaysByField)
  ]);

  const fieldState={};
  for(const fieldKey of fieldKeys){
    const overlay=overlaysByField[fieldKey]||null;
    fieldState[fieldKey]=freeze({
      fieldKey,
      baseValue:baseValue(property,fieldKey),
      effectiveValue:overlay?.value??baseValue(property,fieldKey),
      source:overlay?'GOVERNED_CANONICAL_OVERLAY':'BASE_CANONICAL',
      overlayActive:Boolean(overlay),
      executionId:overlay?.executionId||null,
      promotionDecisionId:overlay?.promotionDecisionId||null,
      evidenceEventId:overlay?.evidenceEventId||null,
      actor:overlay?.actor||null,
      governedAt:overlay?.executedAt||null
    });
  }

  const commandState=buildGovernedPropertyCommandState(property,model);

  return freeze({
    status:'ACTIVE',
    milestone:'M2.27',
    propertyKey:keyOf(property),
    property:effectiveProperty,
    baseProperty:property,
    overlays:freeze(overlays),
    fieldState:freeze(fieldState),
    commandState,
    canonicalState:commandState?.canonicalState||(
      overlays.length?'OVERLAY_ACTIVE':'CANONICAL'
    ),
    invariants:freeze({
      baseMutation:false,
      directWrite:false,
      readOnly:true,
      rollbackAware:true,
      eventReconstructed:true,
      propertyScoped:true
    })
  });
}

export function governedReadValue(readModel,fieldKey){
  return readModel?.fieldState?.[fieldKey]?.effectiveValue??null;
}
