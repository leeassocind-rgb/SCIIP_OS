const freeze=value=>Object.freeze(value);

export const PROPERTY_EXPLORER_DATA=freeze([
  freeze({
    id:'P-SB-ARES-101',
    address:'19500 S Vermont Ave',
    city:'Torrance',
    state:'CA',
    submarket:'South Bay',
    ownerLegal:'South Bay Industrial Owner LLC',
    ownerParent:'Ares Management',
    ownerAliases:freeze(['Ares','Ares Industrial','Ares Management']),
    tenant:'Vacant',
    buildingSf:145000,
    clearHeightFt:32,
    powerAmps:2000,
    status:'AVAILABLE',
    latitude:33.8512,
    longitude:-118.2928,
    yearBuilt:2004,
    assignmentIds:freeze([]),
    transactionType:null,
    recentChange:'Availability confirmed'
  }),
  freeze({
    id:'P-SB-ARES-102',
    address:'20200 S Western Ave',
    city:'Torrance',
    state:'CA',
    submarket:'South Bay',
    ownerLegal:'Western Industrial Holdings LLC',
    ownerParent:'Ares Management',
    ownerAliases:freeze(['Ares','Ares Commercial Real Estate']),
    tenant:'Aerospace User',
    buildingSf:218000,
    clearHeightFt:36,
    powerAmps:4000,
    status:'OFF MARKET',
    latitude:33.8461,
    longitude:-118.3092,
    yearBuilt:2012,
    assignmentIds:freeze([]),
    transactionType:null,
    recentChange:'Ownership entity normalized'
  }),
  freeze({
    id:'P-SB-ARES-103',
    address:'1800 E 223rd St',
    city:'Carson',
    state:'CA',
    submarket:'South Bay',
    ownerLegal:'Carson Logistics Owner LLC',
    ownerParent:'Ares Management',
    ownerAliases:freeze(['Ares','Ares Industrial']),
    tenant:'Vacant',
    buildingSf:118000,
    clearHeightFt:null,
    powerAmps:1600,
    status:'AVAILABLE',
    latitude:33.8240,
    longitude:-118.2420,
    yearBuilt:1998,
    assignmentIds:freeze([]),
    transactionType:null,
    recentChange:'Clear height missing'
  }),
  freeze({
    id:'P-SB-OTHER-201',
    address:'19000 S Alameda St',
    city:'Rancho Dominguez',
    state:'CA',
    submarket:'South Bay',
    ownerLegal:'Prologis LP',
    ownerParent:'Prologis',
    ownerAliases:freeze(['Prologis']),
    tenant:'3PL User',
    buildingSf:256000,
    clearHeightFt:36,
    powerAmps:3000,
    status:'LEASED',
    latitude:33.8601,
    longitude:-118.2304,
    yearBuilt:2016,
    assignmentIds:freeze([]),
    transactionType:'LEASE_COMPARABLE',
    recentChange:'Lease comparable added'
  }),
  freeze({
    id:'P-IEW-201',
    address:'2125 W Lowell St',
    city:'Rialto',
    state:'CA',
    submarket:'Inland Empire West',
    ownerLegal:'Brookfield Logistics Owner LLC',
    ownerParent:'Brookfield Properties',
    ownerAliases:freeze(['Brookfield','Brookfield Properties']),
    tenant:'Vacant',
    buildingSf:664859,
    clearHeightFt:42,
    powerAmps:8000,
    status:'UNDER CONSTRUCTION',
    latitude:34.1069,
    longitude:-117.4112,
    yearBuilt:2027,
    assignmentIds:freeze(['A-BROOKFIELD']),
    transactionType:null,
    recentChange:'Power confirmed at 8,000 amps'
  }),
  freeze({
    id:'P-IEW-701',
    address:'10800 Slover Ave',
    city:'Fontana',
    state:'CA',
    submarket:'Inland Empire West',
    ownerLegal:'Slover Logistics Owner LLC',
    ownerParent:'Institutional Owner',
    ownerAliases:freeze(['Institutional Owner']),
    tenant:'Vacant',
    buildingSf:720000,
    clearHeightFt:40,
    powerAmps:4000,
    status:'AVAILABLE',
    latitude:34.0632,
    longitude:-117.5041,
    yearBuilt:2024,
    assignmentIds:freeze([]),
    transactionType:null,
    recentChange:'Asking rate reduced'
  })
]);

export const DEFAULT_EXPLORER_FILTERS=freeze({
  query:'',
  submarket:'',
  city:'',
  owner:'',
  minBuildingSf:'',
  maxBuildingSf:'',
  minClearHeightFt:'',
  minPowerAmps:'',
  statuses:freeze([]),
  layer:'ALL'
});

export function interpretExplorerQuery(input=''){
  const text=String(input).trim();
  const lower=text.toLowerCase();
  const filters={...DEFAULT_EXPLORER_FILTERS,query:text,statuses:[]};
  const chips=[];

  for(const market of ['South Bay','Inland Empire West','Inland Empire East','San Gabriel Valley','Orange County']){
    if(lower.includes(market.toLowerCase())){
      filters.submarket=market;
      chips.push(chip('submarket',market));
      break;
    }
  }

  const ownerMatch=text.match(/owned by\s+([a-z0-9 &.-]+)/i);
  if(ownerMatch){
    filters.owner=ownerMatch[1].trim();
    chips.push(chip('owner',filters.owner));
  }else if(/\bares\b/i.test(text)){
    filters.owner='Ares';
    chips.push(chip('owner','Ares'));
  }

  const minSf=text.match(/(?:over|above|at least|minimum|min)\s+([\d,]+)\s*(?:sf|square feet)?/i);
  if(minSf){
    filters.minBuildingSf=Number(minSf[1].replaceAll(',',''));
    chips.push(chip('minBuildingSf',`${Number(filters.minBuildingSf).toLocaleString()} SF+`));
  }

  const clear=text.match(/(\d{2})\s*(?:feet|ft|')\s*clear/i)
    ||text.match(/clear height(?: minimum)?\s*(?:of\s*)?(\d{2})/i);
  if(clear){
    filters.minClearHeightFt=Number(clear[1]);
    chips.push(chip('minClearHeightFt',`${filters.minClearHeightFt}′ Clear+`));
  }

  if(/\bavailable\b/i.test(text)){
    filters.statuses=['AVAILABLE','UNDER CONSTRUCTION'];
    chips.push(chip('statuses','Available'));
  }

  return freeze({
    raw:text,
    filters:freeze({...filters,statuses:freeze(filters.statuses)}),
    chips:freeze(chips),
    mode:chips.length?'STRUCTURED':'DIRECT'
  });
}

export function searchExplorerProperties(properties=PROPERTY_EXPLORER_DATA,filters=DEFAULT_EXPLORER_FILTERS){
  const confirmed=[];
  const possible=[];
  const normalizedQuery=String(filters.query||'').toLowerCase().trim();
  const normalizedOwner=String(filters.owner||'').toLowerCase().trim();

  for(const property of properties){
    const reasons=[];
    let possibleMatch=false;

    if(filters.layer!=='ALL'&&!matchesLayer(property,filters.layer))continue;
    if(filters.submarket&&property.submarket!==filters.submarket)continue;
    if(filters.city&&property.city.toLowerCase()!==String(filters.city).toLowerCase())continue;

    if(normalizedOwner){
      const ownerText=[
        property.ownerLegal,
        property.ownerParent,
        ...(property.ownerAliases||[])
      ].join(' ').toLowerCase();
      if(!ownerText.includes(normalizedOwner))continue;
      reasons.push(`Owner family: ${property.ownerParent}`);
    }

    if(filters.minBuildingSf){
      if(Number(property.buildingSf)<Number(filters.minBuildingSf))continue;
      reasons.push(`Building size: ${Number(property.buildingSf).toLocaleString()} SF`);
    }

    if(filters.maxBuildingSf&&Number(property.buildingSf)>Number(filters.maxBuildingSf))continue;

    if(filters.minClearHeightFt){
      if(property.clearHeightFt==null)possibleMatch=true;
      else if(Number(property.clearHeightFt)<Number(filters.minClearHeightFt))continue;
      else reasons.push(`Clear height: ${property.clearHeightFt}′`);
    }

    if(filters.minPowerAmps){
      if(property.powerAmps==null)possibleMatch=true;
      else if(Number(property.powerAmps)<Number(filters.minPowerAmps))continue;
      else reasons.push(`Power: ${Number(property.powerAmps).toLocaleString()} amps`);
    }

    if((filters.statuses||[]).length&&!filters.statuses.includes(property.status))continue;

    if(filters.submarket)reasons.push(`Submarket: ${property.submarket}`);

    if(normalizedQuery&&!hasStructuredFilters(filters)){
      const directText=[
        property.address,
        property.id,
        property.city,
        property.ownerParent,
        property.ownerLegal,
        property.tenant,
        ...(property.ownerAliases||[])
      ].join(' ').toLowerCase();
      if(!directText.includes(normalizedQuery))continue;
      reasons.push('Direct text match');
    }

    const row=freeze({
      property,
      reasons:freeze(reasons),
      matchType:possibleMatch?'POSSIBLE':'CONFIRMED'
    });

    (possibleMatch?possible:confirmed).push(row);
  }

  return freeze({
    confirmed:freeze(sortRows(confirmed)),
    possible:freeze(sortRows(possible)),
    all:freeze(sortRows([...confirmed,...possible])),
    summary:freeze({
      confirmedCount:confirmed.length,
      possibleCount:possible.length,
      totalBuildingSf:confirmed.reduce((sum,row)=>sum+Number(row.property.buildingSf||0),0),
      availableCount:confirmed.filter(row=>['AVAILABLE','UNDER CONSTRUCTION'].includes(row.property.status)).length
    })
  });
}

export function buildLayerCounts(properties=PROPERTY_EXPLORER_DATA){
  return freeze({
    ALL:properties.length,
    AVAILABLE:properties.filter(item=>item.status==='AVAILABLE').length,
    UNDER_CONSTRUCTION:properties.filter(item=>item.status==='UNDER CONSTRUCTION').length,
    OFF_MARKET:properties.filter(item=>item.status==='OFF MARKET').length,
    ASSIGNMENT:properties.filter(item=>(item.assignmentIds||[]).length>0).length,
    LEASE_COMPARABLE:properties.filter(item=>item.transactionType==='LEASE_COMPARABLE').length,
    SALE_COMPARABLE:properties.filter(item=>item.transactionType==='SALE_COMPARABLE').length
  });
}

export function buildCompareSet(selectedIds,properties=PROPERTY_EXPLORER_DATA){
  return freeze(properties.filter(item=>selectedIds.includes(item.id)).slice(0,4));
}

export function buildPropertyDrawerModel(property){
  if(!property)return null;
  return freeze({
    title:property.address,
    subtitle:`${property.city}, ${property.state} · ${property.submarket}`,
    ownership:freeze({
      parent:property.ownerParent,
      legal:property.ownerLegal
    }),
    specs:freeze([
      ['Building size',`${Number(property.buildingSf).toLocaleString()} SF`],
      ['Clear height',property.clearHeightFt==null?'Unknown':`${property.clearHeightFt}′`],
      ['Power',property.powerAmps==null?'Unknown':`${Number(property.powerAmps).toLocaleString()} amps`],
      ['Status',property.status],
      ['Tenant',property.tenant||'Unknown'],
      ['Year built',property.yearBuilt||'Unknown']
    ]),
    recentChange:property.recentChange,
    assignmentIds:freeze(property.assignmentIds||[])
  });
}

function matchesLayer(property,layer){
  if(layer==='AVAILABLE')return property.status==='AVAILABLE';
  if(layer==='UNDER_CONSTRUCTION')return property.status==='UNDER CONSTRUCTION';
  if(layer==='OFF_MARKET')return property.status==='OFF MARKET';
  if(layer==='ASSIGNMENT')return (property.assignmentIds||[]).length>0;
  if(layer==='LEASE_COMPARABLE')return property.transactionType==='LEASE_COMPARABLE';
  if(layer==='SALE_COMPARABLE')return property.transactionType==='SALE_COMPARABLE';
  return true;
}
function hasStructuredFilters(filters){
  return Boolean(
    filters.submarket||filters.city||filters.owner||
    filters.minBuildingSf||filters.maxBuildingSf||
    filters.minClearHeightFt||filters.minPowerAmps||
    (filters.statuses||[]).length||filters.layer!=='ALL'
  );
}
function sortRows(rows){
  return [...rows].sort((a,b)=>Number(b.property.buildingSf)-Number(a.property.buildingSf));
}
function chip(key,label){return freeze({key,label});}
