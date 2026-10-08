// SCIIP Explorer 3.0 — M2.38
// Governed Market Context Metric Presentation Runtime
//
// Presentation-only contract for the visible Market Context ribbon.
// Consumes the governed Market Context result produced after M2.37.
// Does not recalculate or mutate Market Context formulas.

const freeze=x=>Object.freeze(x);

function metricById(marketContext,id){
  return marketContext?.metrics?.find?.(item=>item?.id===id)||null;
}

function number(v){
  const n=Number(v);
  return Number.isFinite(n)?n:null;
}

function metricValue(metric){
  if(!metric)return null;
  for(const key of ['value','metricValue','total','count','average','avg']){
    if(metric[key]!==undefined&&metric[key]!==null){
      const n=number(metric[key]);
      if(n!==null)return n;
      return metric[key];
    }
  }
  return null;
}

function findMetric(marketContext,candidates=[]){
  for(const id of candidates){
    const m=metricById(marketContext,id);
    if(m)return m;
  }
  return null;
}

export function buildGovernedMarketContextMetricPresentation(marketContext){
  const definitions=[
    ['totalSf',['TOTAL_SF','total-sf','totalSf','sf-total'],'Total SF'],
    ['properties',['PROPERTIES','properties','property-count','propertyCount'],'Properties'],
    ['available',['AVAILABLE','available','available-count','availableCount'],'Available'],
    ['avgAsking',['AVG_ASKING','avg-asking','avgAsking','asking-rate'],'Avg Asking'],
    ['avgLeaseComp',['AVG_LEASE_COMP','avg-lease-comp','avgLeaseComp'],'Avg Lease Comp'],
    ['leaseComps',['LEASE_COMPS','lease-comps','leaseComps','lease-comp-count'],'Lease Comps']
  ];

  const metrics={};
  for(const [key,candidates,label] of definitions){
    const source=findMetric(marketContext,candidates);
    metrics[key]=freeze({
      key,
      label,
      sourceMetricId:source?.id||null,
      value:metricValue(source),
      rows:Array.isArray(source?.rows)?freeze([...source.rows]):freeze([]),
      raw:source||null
    });
  }

  return freeze({
    status:'ACTIVE',
    milestone:'M2.38',
    marketContext,
    metrics:freeze(metrics),
    order:freeze(definitions.map(x=>x[0])),
    invariants:freeze({
      governedMarketContextAuthoritative:true,
      presentationOnly:true,
      formulaMutation:false,
      sourceMutation:false,
      filterMutation:false,
      eventStoreMutation:false,
      automaticCanonicalWrites:false
    })
  });
}

export function governedMarketMetric(presentation,key){
  return presentation?.metrics?.[key]||null;
}
