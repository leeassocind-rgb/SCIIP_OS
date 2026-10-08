import{readCanonicalPropertyRuntime}from'./CanonicalPropertyRuntimeRegistry.js';
// SCIIP Explorer 3.0 — M2.21f
// Unified Canonical Property Field Resolver
//
// Authoritative runtime field contract for:
// - PropertyIntelligenceModel / PropertyMetricRail
// - GovernedPropertyState / IntelligenceQuality
// - IntelligenceGapEngine
//
// Read-only. Does not mutate the canonical property record.

function present(v){
  return !(v===null||v===undefined||v==='');
}

function norm(k){
  return String(k??'').replace(/[^a-z0-9]/gi,'').toLowerCase();
}

function scalar(v){
  if(v&&typeof v==='object'){
    for(const key of [
      'value','displayValue','canonicalValue','rawValue',
      'metricValue','formattedValue','text','amount'
    ]){
      if(present(v[key])&&typeof v[key]!=='object') return v[key];
    }
    return null;
  }
  return present(v)?v:null;
}

function numeric(v){
  if(typeof v==='number') return v;
  if(!present(v)) return null;
  const m = String(v).replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : v;
}

export const CANONICAL_PROPERTY_FIELD_SCHEMA = Object.freeze({
  parcelId:Object.freeze({
    aliases:['parcelId','apn','parcelApn','parcelNumber','parcel'],
    numeric:false
  }),
  buildingSf:Object.freeze({
    aliases:['buildingSf','buildingSF','buildingSize','buildingSizeSf','sf','squareFeet','building_sqft'],
    numeric:true
  }),
  landAcres:Object.freeze({
    aliases:['landAcres','landAc','siteAcres','siteAreaAcres','acres','landArea'],
    numeric:true
  }),
  clearHeight:Object.freeze({
    aliases:['clearHeight','clearHt','clearHeightFt','clearHeightFeet','clear','clearance','clearanceHeight'],
    numeric:true
  }),
  powerAmps:Object.freeze({
    aliases:['powerAmps','power','amps','electricalAmps','powerCapacityAmps','electricService'],
    numeric:true
  }),
  propertyType:Object.freeze({
    aliases:['propertyType','buildingType','assetType','type'],
    numeric:false
  }),
  landUse:Object.freeze({
    aliases:['landUse','landUseCode','use','useType'],
    numeric:false
  }),
  assessedTotal:Object.freeze({
    aliases:['assessedTotal','assessedValue','totalAssessedValue'],
    numeric:true
  }),
  ownership:Object.freeze({
    aliases:['ownership','owner','ownerName'],
    numeric:false
  }),
  zoning:Object.freeze({
    aliases:['zoning','zone','zoningCode'],
    numeric:false
  }),
  yearBuilt:Object.freeze({
    aliases:['yearBuilt','builtYear','constructionYear'],
    numeric:true
  }),
  askingRate:Object.freeze({
    aliases:['askingRate','askRate','rate','leaseRate','askingLeaseRate'],
    numeric:false
  }),
  leaseCompRate:Object.freeze({
    aliases:['leaseCompRate','compRate','leaseComparableRate'],
    numeric:false
  })
});

function normalizeValue(fieldKey,value){
  if(!present(value)) return null;
  return CANONICAL_PROPERTY_FIELD_SCHEMA[fieldKey]?.numeric ? numeric(value) : value;
}

function directHit(obj,fieldKey){
  if(!obj||typeof obj!=='object') return null;
  const def=CANONICAL_PROPERTY_FIELD_SCHEMA[fieldKey]||{aliases:[fieldKey],numeric:false};
  const wanted=new Set(def.aliases.map(norm));

  for(const [key,value] of Object.entries(obj)){
    if(!wanted.has(norm(key))) continue;
    const s=scalar(value);
    if(present(s)){
      return Object.freeze({
        found:true,
        value:normalizeValue(fieldKey,s),
        runtimeKey:key
      });
    }
  }
  return null;
}

function deepHit(obj,fieldKey,maxDepth=8){
  if(!obj||typeof obj!=='object') return null;
  const seen=new Set();
  const q=[{value:obj,path:'$',depth:0}];

  while(q.length){
    const node=q.shift();
    if(!node.value||typeof node.value!=='object'||seen.has(node.value)||node.depth>maxDepth) continue;
    seen.add(node.value);

    const d=directHit(node.value,fieldKey);
    if(d){
      return Object.freeze({
        ...d,
        path:`${node.path}.${d.runtimeKey}`
      });
    }

    if(Array.isArray(node.value)){
      for(let i=0;i<node.value.length;i++){
        const child=node.value[i];
        if(child&&typeof child==='object'){
          q.push({value:child,path:`${node.path}[${i}]`,depth:node.depth+1});
        }
      }
      continue;
    }

    for(const [key,value] of Object.entries(node.value)){
      if(value&&typeof value==='object'){
        q.push({value,path:`${node.path}.${key}`,depth:node.depth+1});
      }
    }
  }
  return null;
}

export function canonicalPropertySources(property,model){
  return Object.freeze([
    {name:'PROPERTY_ARGUMENT',value:property},
    {name:'MODEL_PROPERTY',value:model?.property},
    {name:'MODEL_SELECTED_PROPERTY',value:model?.selectedProperty},
    {name:'MODEL_CANONICAL_PROPERTY',value:model?.canonicalProperty},
    {name:'MODEL_PROPERTY_RECORD',value:model?.propertyRecord},
    {name:'MODEL_SNAPSHOT',value:model?.snapshot},
    {name:'MODEL_PROPERTY_METRICS',value:model?.propertyMetrics},
    {name:'ROOT_MODEL',value:model}
  ].filter(x=>x.value&&typeof x.value==='object'));
}

export function resolveCanonicalPropertyField(property,model,fieldKey){
  for(const source of canonicalPropertySources(property,model)){
    const hit=deepHit(source.value,fieldKey);
    if(hit){
      return Object.freeze({
        fieldKey,
        found:true,
        value:hit.value,
        source:source.name,
        path:hit.path,
        runtimeKey:hit.runtimeKey
      });
    }
  }


  const published=readCanonicalPropertyRuntime(property)||readCanonicalPropertyRuntime(model?.property)||readCanonicalPropertyRuntime(model?.selectedProperty);
  if(published){
    const snapshotKey=fieldKey==='clearHeight'?'clearHeightFt':fieldKey;
    const snapshotValue=published?.snapshot?.[snapshotKey];
    if(snapshotValue!==null&&snapshotValue!==undefined&&snapshotValue!==''){
      return Object.freeze({
        fieldKey,
        found:true,
        value:snapshotValue,
        source:'PROPERTY_METRIC_RUNTIME_REGISTRY',
        path:`snapshot.${snapshotKey}`,
        runtimeKey:snapshotKey
      });
    }

    const propertyAliases=CANONICAL_PROPERTY_FIELD_SCHEMA[fieldKey]?.aliases||[fieldKey];
    const runtimeProperty=published?.property;
    if(runtimeProperty&&typeof runtimeProperty==='object'){
      for(const alias of propertyAliases){
        const value=runtimeProperty?.[alias];
        if(value!==null&&value!==undefined&&value!==''){
          return Object.freeze({
            fieldKey,
            found:true,
            value:normalizeValue(fieldKey,value),
            source:'PROPERTY_METRIC_RUNTIME_REGISTRY',
            path:`property.${alias}`,
            runtimeKey:alias
          });
        }
      }
    }
  }

  return Object.freeze({
    fieldKey,
    found:false,
    value:null,
    source:'UNRESOLVED',
    path:null,
    runtimeKey:null
  });
}

export function resolveCanonicalPropertyRecord(property,model){
  const result={};
  for(const fieldKey of Object.keys(CANONICAL_PROPERTY_FIELD_SCHEMA)){
    result[fieldKey]=resolveCanonicalPropertyField(property,model,fieldKey);
  }
  return Object.freeze(result);
}

export function resolveCanonicalPropertyFields(property,model,fields=[]){
  return Object.freeze(fields.map(field=>{
    if(present(field?.effectiveCanonicalValue)){
      return Object.freeze({
        ...field,
        canonicalFieldResolution:Object.freeze({
          fieldKey:field.key,
          found:true,
          value:field.effectiveCanonicalValue,
          source:'GOVERNED_PROVENANCE',
          path:field.key,
          runtimeKey:field.key
        })
      });
    }

    const resolved=resolveCanonicalPropertyField(property,model,field.key);

    return Object.freeze({
      ...field,
      effectiveCanonicalValue:resolved.found
        ? resolved.value
        : field?.effectiveCanonicalValue??null,
      canonicalFieldResolution:resolved
    });
  }));
}

export function buildCanonicalPropertySnapshot(property,model=null){
  const r=resolveCanonicalPropertyRecord(property,model);
  return Object.freeze({
    buildingSf:r.buildingSf.value,
    landAcres:r.landAcres.value,
    clearHeightFt:r.clearHeight.value,
    powerAmps:r.powerAmps.value,
    parcelId:r.parcelId.value,
    propertyType:r.propertyType.value,
    landUse:r.landUse.value,
    assessedTotal:r.assessedTotal.value
  });
}

export function certifyCanonicalRuntimeInvariant({
  property,
  model,
  fields=[],
  gaps=[]
}={}){
  const resolved=resolveCanonicalPropertyRecord(property,model);
  const byField=new Map((fields||[]).map(x=>[x.key,x]));
  const violations=[];

  for(const fieldKey of Object.keys(CANONICAL_PROPERTY_FIELD_SCHEMA)){
    const canonical=
      present(byField.get(fieldKey)?.effectiveCanonicalValue)
        ? byField.get(fieldKey).effectiveCanonicalValue
        : resolved[fieldKey]?.value;

    const missing=(gaps||[]).some(
      gap=>gap.fieldKey===fieldKey&&gap.type==='MISSING'
    );

    if(present(canonical)&&missing){
      violations.push(Object.freeze({
        fieldKey,
        canonicalValue:canonical,
        source:resolved[fieldKey]?.source||'GOVERNED_PROVENANCE',
        path:resolved[fieldKey]?.path||fieldKey
      }));
    }
  }

  return Object.freeze({
    valid:violations.length===0,
    violations:Object.freeze(violations)
  });
}
