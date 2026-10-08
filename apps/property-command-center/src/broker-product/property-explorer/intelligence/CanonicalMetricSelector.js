// SCIIP Explorer 3.0 — M2.21e
// Canonical Metric Strip Source Unification
//
// One selector is used by BOTH:
//  1) the property metric strip
//  2) the intelligence gap engine
//
// This prevents the UI from rendering a known canonical metric while
// intelligence classifies the same field as MISSING.

function present(v){
  return !(v===null||v===undefined||v==='');
}
function norm(v){
  return String(v??'').replace(/[^a-z0-9]/gi,'').toLowerCase();
}
function primitive(v){
  if(v&&typeof v==='object'){
    for(const key of [
      'value','displayValue','canonicalValue','rawValue',
      'metricValue','text','amount','formattedValue'
    ]){
      if(present(v[key])&&typeof v[key]!=='object') return v[key];
    }
    return null;
  }
  return present(v)?v:null;
}
function numberLike(v){
  if(typeof v==='number') return v;
  if(!present(v)) return null;
  const m=String(v).replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);
  return m?Number(m[0]):v;
}

const DEF={
  buildingSf:{
    aliases:['buildingSf','buildingSF','buildingSize','buildingSizeSf','sf','squareFeet'],
    labels:['building','building sf','building size','square feet'],
    numeric:true
  },
  landAcres:{
    aliases:['landAcres','landAc','acres','siteAcres','siteAreaAcres','landArea'],
    labels:['land','land acres','site acres','acres'],
    numeric:true
  },
  clearHeight:{
    aliases:['clearHeight','clearHt','clearHeightFt','clearHeightFeet','clear','clearance','clearanceHeight'],
    labels:['clear height','clear','clearance','clearance height'],
    numeric:true
  },
  powerAmps:{
    aliases:['powerAmps','power','amps','electricalAmps','powerCapacityAmps','electricService'],
    labels:['power','amps','electrical','electrical service','power capacity'],
    numeric:true
  },
  parcelId:{
    aliases:['parcelId','parcel','apn','parcelApn','parcelNumber'],
    labels:['parcel','apn','parcel id'],
    numeric:false
  },
  propertyType:{
    aliases:['propertyType','buildingType','assetType','type'],
    labels:['property type','building type','asset type'],
    numeric:false
  },
  landUse:{
    aliases:['landUse','landUseCode','use','useType'],
    labels:['land use','use'],
    numeric:false
  },
  assessedTotal:{
    aliases:['assessedTotal','assessedValue','totalAssessedValue'],
    labels:['assessed total','assessed value'],
    numeric:true
  }
};

function normalizeFieldValue(fieldKey,v){
  if(!present(v)) return null;
  return DEF[fieldKey]?.numeric ? numberLike(v) : v;
}

function labelValueHit(fieldKey,obj){
  if(!obj||typeof obj!=='object') return null;
  const d=DEF[fieldKey]||{labels:[fieldKey]};
  const label=obj.label??obj.name??obj.title??obj.metric??obj.caption??obj.heading??null;
  if(!present(label)) return null;
  const n=norm(label);
  if(!d.labels.some(x=>{
    const q=norm(x);
    return n===q||n.includes(q)||q.includes(n);
  })) return null;

  for(const key of [
    'value','displayValue','canonicalValue','rawValue',
    'metricValue','text','amount','formattedValue'
  ]){
    const v=primitive(obj[key]);
    if(present(v)) return normalizeFieldValue(fieldKey,v);
  }
  return null;
}

function deepTrace(root,fieldKey,maxDepth=10){
  if(!root||typeof root!=='object') return null;
  const d=DEF[fieldKey]||{aliases:[fieldKey]};
  const wanted=new Set(d.aliases.map(norm));
  const seen=new Set();
  const q=[{obj:root,path:'$',depth:0}];

  while(q.length){
    const {obj,path,depth}=q.shift();
    if(!obj||typeof obj!=='object'||seen.has(obj)||depth>maxDepth) continue;
    seen.add(obj);

    const lv=labelValueHit(fieldKey,obj);
    if(present(lv)){
      return {value:lv,path,mode:'LABEL_VALUE'};
    }

    if(Array.isArray(obj)){
      for(let i=0;i<obj.length;i++){
        const child=obj[i];
        if(child&&typeof child==='object'){
          q.push({obj:child,path:`${path}[${i}]`,depth:depth+1});
        }
      }
      continue;
    }

    for(const [key,val] of Object.entries(obj)){
      if(wanted.has(norm(key))){
        const p=primitive(val);
        if(present(p)){
          return {
            value:normalizeFieldValue(fieldKey,p),
            path:`${path}.${key}`,
            mode:'KEY_ALIAS'
          };
        }
      }
      if(val&&typeof val==='object'){
        q.push({obj:val,path:`${path}.${key}`,depth:depth+1});
      }
    }
  }
  return null;
}

export function canonicalMetricSources(property,model,metricStripSource=null){
  return [
    {name:'METRIC_STRIP_SOURCE',value:metricStripSource},
    {name:'MODEL_PROPERTY_METRICS',value:model?.propertyMetrics},
    {name:'MODEL_METRICS',value:model?.metrics},
    {name:'MODEL_SPECS',value:model?.specs},
    {name:'MODEL_SNAPSHOT',value:model?.snapshot},
    {name:'MODEL_PROPERTY',value:model?.property},
    {name:'MODEL_SELECTED_PROPERTY',value:model?.selectedProperty},
    {name:'MODEL_CANONICAL_PROPERTY',value:model?.canonicalProperty},
    {name:'MODEL_PROPERTY_RECORD',value:model?.propertyRecord},
    {name:'ROOT_MODEL',value:model},
    {name:'PROPERTY_ARGUMENT',value:property}
  ].filter(x=>x.value&&typeof x.value==='object');
}

export function selectCanonicalMetric(property,model,fieldKey,metricStripSource=null){
  for(const source of canonicalMetricSources(property,model,metricStripSource)){
    const hit=deepTrace(source.value,fieldKey);
    if(hit){
      return Object.freeze({
        fieldKey,
        found:true,
        value:hit.value,
        source:source.name,
        path:hit.path,
        mode:hit.mode
      });
    }
  }
  return Object.freeze({
    fieldKey,
    found:false,
    value:null,
    source:'UNRESOLVED',
    path:null,
    mode:null
  });
}

export function buildCanonicalMetricStrip(property,model,metricStripSource=null){
  const keys=['buildingSf','landAcres','clearHeight','powerAmps','parcelId'];
  const result={};
  for(const key of keys){
    result[key]=selectCanonicalMetric(property,model,key,metricStripSource);
  }
  return Object.freeze(result);
}

export function alignFieldsWithCanonicalMetricSelector(
  property,model,fields=[],metricStripSource=null
){
  return Object.freeze(fields.map(field=>{
    if(present(field?.effectiveCanonicalValue)){
      return Object.freeze({
        ...field,
        canonicalMetricSelector:Object.freeze({
          found:true,
          fieldKey:field.key,
          value:field.effectiveCanonicalValue,
          source:'GOVERNED_PROVENANCE',
          path:field.key,
          mode:'GOVERNED'
        })
      });
    }

    const selected=selectCanonicalMetric(
      property,model,field.key,metricStripSource
    );

    return Object.freeze({
      ...field,
      effectiveCanonicalValue:selected.found
        ? selected.value
        : field?.effectiveCanonicalValue??null,
      canonicalMetricSelector:selected
    });
  }));
}

export function certifyMetricGapConsistency(
  property,model,fields,gaps,metricStripSource=null
){
  const keys=['buildingSf','landAcres','clearHeight','powerAmps','parcelId'];
  const violations=[];

  for(const key of keys){
    const metric=selectCanonicalMetric(
      property,model,key,metricStripSource
    );
    const field=(fields||[]).find(x=>x.key===key);
    const canonical=present(field?.effectiveCanonicalValue)
      ? field.effectiveCanonicalValue
      : metric.value;
    const missing=(gaps||[]).some(
      x=>x.fieldKey===key&&x.type==='MISSING'
    );
    if(present(canonical)&&missing){
      violations.push({
        fieldKey:key,
        canonicalValue:canonical,
        source:metric.source,
        path:metric.path
      });
    }
  }

  return Object.freeze({
    valid:violations.length===0,
    violations:Object.freeze(violations)
  });
}
