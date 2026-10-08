// M2.21d — Clear Height Canonical Source Trace & Alignment Repair
// Traces canonical values through nested runtime objects, metric arrays,
// and label/value presentation structures. Read-only.

function present(v){return !(v===null||v===undefined||v==='');}
function norm(v){return String(v??'').replace(/[^a-z0-9]/gi,'').toLowerCase();}
function scalar(v){
  if(v&&typeof v==='object'){
    for(const k of ['value','displayValue','canonicalValue','rawValue','metricValue','text']){
      if(present(v[k])&&typeof v[k]!=='object')return v[k];
    }
    return null;
  }
  return present(v)?v:null;
}

const FIELD_META={
  clearHeight:{
    aliases:['clearHeight','clearHt','clearHeightFt','clearHeightFeet','clear','clearance','clearanceHeight'],
    labels:['clear height','clear','clearance','clearance height']
  },
  powerAmps:{
    aliases:['powerAmps','power','amps','electricalAmps','powerCapacityAmps','electricService'],
    labels:['power','amps','electrical','electrical service','power capacity']
  },
  buildingSf:{
    aliases:['buildingSf','buildingSF','buildingSize','buildingSizeSf','sf','squareFeet'],
    labels:['building','building sf','building size','square feet']
  },
  landAcres:{
    aliases:['landAcres','landAc','acres','siteAcres','siteAreaAcres','landArea'],
    labels:['land','land acres','site acres','acres']
  },
  parcelId:{
    aliases:['parcelId','parcel','apn','parcelApn','parcelNumber'],
    labels:['parcel','apn','parcel id']
  }
};

function parseFieldValue(fieldKey,value){
  if(!present(value))return null;
  if(typeof value==='number')return value;
  const s=String(value).trim();
  if(fieldKey==='clearHeight'){
    const m=s.match(/-?\d+(?:\.\d+)?/);
    return m?Number(m[0]):s;
  }
  if(fieldKey==='powerAmps'){
    const m=s.replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);
    return m?Number(m[0]):s;
  }
  if(fieldKey==='buildingSf'){
    const m=s.replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);
    return m?Number(m[0]):s;
  }
  if(fieldKey==='landAcres'){
    const m=s.replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);
    return m?Number(m[0]):s;
  }
  return value;
}

function labelMatches(fieldKey,obj){
  if(!obj||typeof obj!=='object')return false;
  const meta=FIELD_META[fieldKey]||{labels:[fieldKey]};
  const label=
    obj.label??obj.name??obj.title??obj.metric??obj.keyLabel??obj.caption??obj.heading??null;
  if(!present(label))return false;
  const n=norm(label);
  return meta.labels.some(x=>{
    const nx=norm(x);
    return n===nx||n.includes(nx)||nx.includes(n);
  });
}

function valueFromPresentationObject(fieldKey,obj){
  if(!obj||typeof obj!=='object')return null;
  if(!labelMatches(fieldKey,obj))return null;
  for(const k of ['value','displayValue','canonicalValue','rawValue','metricValue','text','amount']){
    const v=scalar(obj[k]);
    if(present(v))return parseFieldValue(fieldKey,v);
  }
  return null;
}

function aliases(fieldKey){
  return (FIELD_META[fieldKey]?.aliases||[fieldKey]).map(norm);
}

function traceObject(root,fieldKey,maxDepth=8){
  if(!root||typeof root!=='object')return null;
  const wanted=new Set(aliases(fieldKey));
  const seen=new Set();
  const q=[{value:root,path:'$',depth:0}];

  while(q.length){
    const node=q.shift();
    const obj=node.value;
    if(!obj||typeof obj!=='object'||seen.has(obj)||node.depth>maxDepth)continue;
    seen.add(obj);

    const presented=valueFromPresentationObject(fieldKey,obj);
    if(present(presented)){
      return {
        value:presented,
        path:node.path,
        mode:'LABEL_VALUE_PRESENTATION'
      };
    }

    if(Array.isArray(obj)){
      for(let i=0;i<obj.length;i++){
        const child=obj[i];
        if(child&&typeof child==='object'){
          q.push({value:child,path:`${node.path}[${i}]`,depth:node.depth+1});
        }
      }
      continue;
    }

    for(const [k,v] of Object.entries(obj)){
      if(wanted.has(norm(k))){
        const s=scalar(v);
        if(present(s)){
          return {
            value:parseFieldValue(fieldKey,s),
            path:`${node.path}.${k}`,
            mode:'KEY_ALIAS'
          };
        }
        if(v&&typeof v==='object'){
          const pv=valueFromPresentationObject(fieldKey,{label:k,...v});
          if(present(pv)){
            return {
              value:pv,
              path:`${node.path}.${k}`,
              mode:'KEY_OBJECT'
            };
          }
        }
      }

      if(v&&typeof v==='object'){
        q.push({value:v,path:`${node.path}.${k}`,depth:node.depth+1});
      }
    }
  }
  return null;
}

export function canonicalTraceSources(property,model){
  return [
    {name:'MODEL_PROPERTY',value:model?.property},
    {name:'SELECTED_PROPERTY',value:model?.selectedProperty},
    {name:'CANONICAL_PROPERTY',value:model?.canonicalProperty},
    {name:'PROPERTY_RECORD',value:model?.propertyRecord},
    {name:'PROPERTY_METRICS',value:model?.propertyMetrics},
    {name:'METRICS',value:model?.metrics},
    {name:'SPECS',value:model?.specs},
    {name:'SNAPSHOT',value:model?.snapshot},
    {name:'ROOT_MODEL',value:model},
    {name:'PROPERTY_ARGUMENT',value:property}
  ].filter(x=>x.value&&typeof x.value==='object');
}

export function traceCanonicalRuntimeField(property,model,fieldKey){
  for(const source of canonicalTraceSources(property,model)){
    const hit=traceObject(source.value,fieldKey);
    if(hit){
      return Object.freeze({
        found:true,
        fieldKey,
        value:hit.value,
        source:source.name,
        path:hit.path,
        mode:hit.mode
      });
    }
  }
  return Object.freeze({
    found:false,
    fieldKey,
    value:null,
    source:'UNRESOLVED',
    path:null,
    mode:null
  });
}

export function alignCanonicalRuntimeTrace(property,model,fields=[]){
  return Object.freeze(fields.map(field=>{
    if(present(field?.effectiveCanonicalValue)){
      return Object.freeze({
        ...field,
        canonicalSourceTrace:Object.freeze({
          found:true,
          fieldKey:field.key,
          value:field.effectiveCanonicalValue,
          source:'GOVERNED_PROVENANCE',
          path:field.key,
          mode:'GOVERNED'
        })
      });
    }

    const trace=traceCanonicalRuntimeField(property,model,field.key);
    return Object.freeze({
      ...field,
      effectiveCanonicalValue:trace.found?trace.value:field?.effectiveCanonicalValue??null,
      canonicalSourceTrace:trace
    });
  }));
}

export function certifyClearHeightInvariant(property,model,fields,gaps){
  const trace=traceCanonicalRuntimeField(property,model,'clearHeight');
  const clearField=(fields||[]).find(x=>x.key==='clearHeight');
  const clearGap=(gaps||[]).find(x=>x.fieldKey==='clearHeight'&&x.type==='MISSING')||null;

  const known=
    present(clearField?.effectiveCanonicalValue)||
    (trace.found&&present(trace.value));

  return Object.freeze({
    valid:!(known&&clearGap),
    known,
    canonicalValue:present(clearField?.effectiveCanonicalValue)
      ? clearField.effectiveCanonicalValue
      : trace.value,
    trace,
    missingGap:Boolean(clearGap)
  });
}
