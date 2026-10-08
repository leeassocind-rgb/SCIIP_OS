const EARTH_RADIUS_MILES=3958.8;

export const DEFAULT_MARKET_FILTERS=Object.freeze({minSf:0,maxSf:0,minClearHeight:0});
export const MARKET_RADII=Object.freeze([1,3,5,10]);

export function buildMarketContext({subject,properties=[],radiusMiles=5,filters=DEFAULT_MARKET_FILTERS,visibility={base:true,available:true,comparable:true,supersheet:true}}={}){
  if(!subject)throw new Error('subject is required');
  const normalizedFilters={
    minSf:positiveNumber(filters.minSf),
    maxSf:positiveNumber(filters.maxSf),
    minClearHeight:positiveNumber(filters.minClearHeight)
  };
  const cohort=properties.filter(property=>{
    if(!hasCoordinates(property)||!hasCoordinates(subject))return property.id===subject.id;
    if(haversineMiles(subject,property)>Number(radiusMiles||5))return false;
    if(!passesVisibility(property,visibility)&&property.id!==subject.id)return false;
    if(!passesFilters(property,normalizedFilters)&&property.id!==subject.id)return false;
    return true;
  });
  const inventory=cohort.filter(row=>Number(row.buildingSf||0)>0);
  const available=cohort.filter(row=>row.recordType==='AVAILABLE'||row.status==='AVAILABLE');
  const asking=cohort.filter(row=>Number(row.askingRate)>0);
  const leaseComps=cohort.filter(row=>row.recordType==='LEASE_COMPARABLE'&&Number(row.compRate)>0);
  const totalSf=inventory.reduce((sum,row)=>sum+Number(row.buildingSf||0),0);
  const availableSf=available.reduce((sum,row)=>sum+Number(row.availableSf||row.buildingSf||0),0);
  const metrics=[
    metric('total-sf','Total SF',compactNumber(totalSf),inventory,`${inventory.length} properties in cohort`),
    metric('properties','Properties',String(inventory.length),inventory,`${radiusMiles} mile analysis universe`),
    metric('available','Available',String(available.length),available,`${compactNumber(availableSf)} SF available`),
    metric('asking','Avg Asking',moneyRate(average(asking.map(row=>row.askingRate))),asking,`${asking.length} asking-rate records`),
    metric('comp-rate','Avg Lease Comp',moneyRate(average(leaseComps.map(row=>row.compRate))),leaseComps,`${leaseComps.length} lease comps`),
    metric('lease-comps','Lease Comps',String(leaseComps.length),leaseComps,'Current filtered comp set')
  ];
  return Object.freeze({
    subjectPropertyId:subject.id,
    radiusMiles:Number(radiusMiles||5),
    filters:Object.freeze(normalizedFilters),
    filtered:isFiltered(normalizedFilters),
    cohort:Object.freeze(cohort),
    metrics:Object.freeze(metrics),
    summary:`${inventory.length} properties · ${compactNumber(totalSf)} SF · ${radiusMiles} mi${isFiltered(normalizedFilters)?' · filtered':''}`
  });
}

export function passesMarketFilters(property,filters=DEFAULT_MARKET_FILTERS){
  return passesFilters(property,{minSf:positiveNumber(filters.minSf),maxSf:positiveNumber(filters.maxSf),minClearHeight:positiveNumber(filters.minClearHeight)});
}

export function isPropertyVisibleForMarket(property,visibility){return passesVisibility(property,visibility);}

function metric(id,label,value,rows,subtitle){
  return Object.freeze({id,label,value,subtitle,rows:Object.freeze(rows.map(row=>Object.freeze({
    propertyId:row.id,title:row.address,meta:rowMeta(row)
  })))});
}
function rowMeta(row){
  const bits=[];
  if(Number(row.buildingSf)>0)bits.push(`${Number(row.buildingSf).toLocaleString()} SF`);
  if(Number(row.askingRate)>0)bits.push(`${moneyRate(row.askingRate)} ask`);
  if(Number(row.compRate)>0)bits.push(`${moneyRate(row.compRate)} comp`);
  bits.push(row.recordType?.replaceAll('_',' ')||row.status||'Property');
  return bits.join(' · ');
}
function passesVisibility(property,visibility={}){
  const layers=property.mapLayers||['base'];
  return layers.some(layer=>Boolean(visibility[layer]));
}
function passesFilters(property,filters){
  const sf=Number(property.buildingSf||0);
  const clear=Number(property.clearHeightFt||0);
  if(filters.minSf&&sf<filters.minSf)return false;
  if(filters.maxSf&&sf>filters.maxSf)return false;
  if(filters.minClearHeight&&clear<filters.minClearHeight)return false;
  return true;
}
function hasCoordinates(row){return Number.isFinite(Number(row?.lat))&&Number.isFinite(Number(row?.lng));}
function haversineMiles(a,b){
  const toRad=value=>value*Math.PI/180;
  const lat1=toRad(Number(a.lat)),lat2=toRad(Number(b.lat));
  const dLat=lat2-lat1,dLng=toRad(Number(b.lng)-Number(a.lng));
  const h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2*EARTH_RADIUS_MILES*Math.asin(Math.min(1,Math.sqrt(h)));
}
function average(values){const valid=values.map(Number).filter(Number.isFinite).filter(value=>value>0);return valid.length?valid.reduce((sum,value)=>sum+value,0)/valid.length:0;}
function positiveNumber(value){const n=Number(value);return Number.isFinite(n)&&n>0?n:0;}
function isFiltered(filters){return Boolean(filters.minSf||filters.maxSf||filters.minClearHeight);}
function moneyRate(value){return Number(value)?`$${Number(value).toFixed(2)}`:'—';}
function compactNumber(value){const n=Number(value)||0;if(n>=1_000_000)return`${(n/1_000_000).toFixed(n>=10_000_000?1:2).replace(/\.0+$/,'')}M`;if(n>=1_000)return`${(n/1_000).toFixed(n>=100_000?0:1)}K`;return n.toLocaleString();}
