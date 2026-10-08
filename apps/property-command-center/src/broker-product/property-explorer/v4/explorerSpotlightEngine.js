const freeze=value=>Object.freeze(value);

export const MARKER_TYPES=freeze({
  AVAILABLE:'AVAILABLE',
  ASSIGNMENT:'ASSIGNMENT',
  PROSPECT:'PROSPECT',
  LEASE_COMPARABLE:'LEASE_COMPARABLE',
  SALE_COMPARABLE:'SALE_COMPARABLE',
  REQUIREMENT:'REQUIREMENT'
});

export function buildMarketSpotlight({
  selectedProperty,
  properties=[],
  comparables=[],
  requirements=[],
  assignments=[],
  radiusMiles=5
}={}){
  if(!selectedProperty)throw new Error('selectedProperty is required');

  const nearbyProperties=properties
    .filter(item=>item.id!==selectedProperty.id)
    .map(item=>({
      item,
      distanceMiles:haversineMiles(selectedProperty,item)
    }))
    .filter(row=>row.distanceMiles<=radiusMiles)
    .sort((a,b)=>a.distanceMiles-b.distanceMiles);

  const nearbyComparables=comparables
    .map(item=>({
      item,
      distanceMiles:haversineMiles(selectedProperty,item)
    }))
    .filter(row=>row.distanceMiles<=radiusMiles)
    .sort((a,b)=>a.distanceMiles-b.distanceMiles);

  const matchingRequirements=requirements
    .filter(item=>matchesRequirement(selectedProperty,item))
    .map(item=>freeze({
      ...item,
      fitScore:requirementFitScore(selectedProperty,item)
    }))
    .sort((a,b)=>b.fitScore-a.fitScore);

  const relatedAssignments=assignments.filter(
    item=>item.propertyId===selectedProperty.id
  );

  return freeze({
    propertyId:selectedProperty.id,
    radiusMiles,
    competitiveProperties:freeze(
      nearbyProperties
        .filter(row=>['AVAILABLE','UNDER CONSTRUCTION'].includes(row.item.status))
        .map(row=>freeze(row))
    ),
    comparables:freeze(nearbyComparables.map(row=>freeze(row))),
    requirements:freeze(matchingRequirements),
    assignments:freeze(relatedAssignments),
    summary:buildSpotlightSummary({
      selectedProperty,
      nearbyProperties,
      nearbyComparables,
      matchingRequirements,
      relatedAssignments,
      radiusMiles
    })
  });
}

export function buildPropertyHealthScore({
  property,
  market={}
}={}){
  if(!property)throw new Error('property is required');

  const factors=[
    scoreFactor('Power',scale(property.powerAmps,1000,8000),`${Number(property.powerAmps||0).toLocaleString()} amps`),
    scoreFactor('Clear Height',scale(property.clearHeightFt,24,42),property.clearHeightFt?`${property.clearHeightFt}′`:'Unknown'),
    scoreFactor('Modernity',scale(property.yearBuilt,1980,2027),String(property.yearBuilt||'Unknown')),
    scoreFactor('Market Demand',scale(market.demandScore??70,0,100),`${market.demandScore??70}/100`),
    scoreFactor('Competitive Pressure',100-scale(market.competitorCount??8,0,20),`${market.competitorCount??8} competitors`),
    scoreFactor('Availability Position',property.status==='AVAILABLE'||property.status==='UNDER CONSTRUCTION'?88:62,property.status)
  ];

  const weighted=Math.round(
    factors.reduce((sum,item)=>sum+item.score,0)/factors.length
  );

  return freeze({
    score:weighted,
    label:weighted>=85?'Strong':weighted>=70?'Healthy':'Watch',
    factors:freeze(factors)
  });
}

export function buildWhyExplanation({
  property,
  spotlight,
  health
}={}){
  if(!property)throw new Error('property is required');

  const evidence=[
    `${Number(property.buildingSf||0).toLocaleString()} SF building profile`,
    `${property.clearHeightFt||'Unknown'}′ clear height`,
    `${Number(property.powerAmps||0).toLocaleString()} amps`,
    `${spotlight?.competitiveProperties?.length||0} nearby competitive properties`,
    `${spotlight?.comparables?.length||0} nearby comparables`,
    `${spotlight?.requirements?.length||0} matching tenant requirements`,
    `Health score ${health?.score||0}`
  ];

  return freeze({
    headline:`Why ${property.address||property.name} matters`,
    conclusion:buildConclusion(property,spotlight,health),
    evidence:freeze(evidence),
    confidencePct:Math.min(
      99,
      75+
      (property.clearHeightFt?5:0)+
      (property.powerAmps?5:0)+
      ((spotlight?.comparables?.length||0)>0?5:0)+
      ((spotlight?.requirements?.length||0)>0?5:0)
    )
  });
}

export function buildPropertyTimeline(property){
  const events=[
    freeze({
      date:'2026-08-06',
      type:'DATA',
      title:'Property intelligence refreshed',
      detail:'Latest governed property, market, and assignment evidence applied.'
    }),
    freeze({
      date:'2026-08-05',
      type:'MARKET',
      title:property.recentChange||'Market record updated',
      detail:'Change retained in permanent property history.'
    }),
    freeze({
      date:'2026-07-22',
      type:'ASSIGNMENT',
      title:'Assignment report published',
      detail:'Recurring client report snapshot preserved.'
    }),
    freeze({
      date:'2026-06-18',
      type:'PROPERTY',
      title:'Property promoted from SuperSheet',
      detail:'Canonical property identity and evidence links created.'
    })
  ];

  return freeze(events);
}

export function parseExplorerCommand(input=''){
  const raw=String(input).trim();
  const lower=raw.toLowerCase();
  const actions=[];

  if(lower.includes('spotlight'))actions.push('OPEN_SPOTLIGHT');
  if(lower.includes('compet'))actions.push('SHOW_COMPETITION');
  if(lower.includes('lease comp'))actions.push('SHOW_LEASE_COMPARABLES');
  if(lower.includes('sale comp'))actions.push('SHOW_SALE_COMPARABLES');
  if(lower.includes('requirement'))actions.push('SHOW_REQUIREMENTS');
  if(lower.includes('assignment'))actions.push('OPEN_ASSIGNMENT');
  if(lower.includes('why'))actions.push('OPEN_WHY');
  if(lower.includes('timeline'))actions.push('OPEN_TIMELINE');

  return freeze({
    raw,
    actions:freeze(actions.length?actions:['SEARCH_PROPERTIES'])
  });
}

export function createBasemapProviderConfig({
  provider='PLACEHOLDER',
  apiKey='',
  style='industrial-light'
}={}){
  const supported=['PLACEHOLDER','MAPBOX','GOOGLE_MAPS','ARCGIS'];
  if(!supported.includes(provider)){
    throw new Error(`Unsupported basemap provider: ${provider}`);
  }
  return freeze({
    provider,
    apiKeyConfigured:Boolean(apiKey),
    style,
    ready:provider==='PLACEHOLDER'||Boolean(apiKey)
  });
}

function buildSpotlightSummary({
  selectedProperty,
  nearbyProperties,
  nearbyComparables,
  matchingRequirements,
  relatedAssignments,
  radiusMiles
}){
  return [
    `${selectedProperty.address||selectedProperty.name} Market Spotlight covers a ${radiusMiles}-mile radius.`,
    `${nearbyProperties.length} governed properties, ${nearbyComparables.length} comparables, and ${matchingRequirements.length} tenant requirements are relevant.`,
    relatedAssignments.length
      ?`${relatedAssignments.length} active assignment is connected to the property.`
      :'No active assignment is currently connected.'
  ].join(' ');
}

function matchesRequirement(property,requirement){
  if(requirement.submarket&&requirement.submarket!==property.submarket)return false;
  if(requirement.minSf&&property.buildingSf<requirement.minSf)return false;
  if(requirement.maxSf&&property.buildingSf>requirement.maxSf)return false;
  if(requirement.minClearHeightFt&&(property.clearHeightFt||0)<requirement.minClearHeightFt)return false;
  if(requirement.minPowerAmps&&(property.powerAmps||0)<requirement.minPowerAmps)return false;
  return true;
}

function requirementFitScore(property,requirement){
  if(!matchesRequirement(property,requirement))return 0;
  let score=65;
  if(requirement.submarket===property.submarket)score+=10;
  if(requirement.minClearHeightFt&&property.clearHeightFt>=requirement.minClearHeightFt)score+=10;
  if(requirement.minPowerAmps&&property.powerAmps>=requirement.minPowerAmps)score+=10;
  if(requirement.preferredSf){
    const delta=Math.abs(property.buildingSf-requirement.preferredSf);
    score+=Math.max(0,5-Math.round(delta/Math.max(1,requirement.preferredSf)*5));
  }else score+=5;
  return Math.min(100,score);
}

function buildConclusion(property,spotlight,health){
  const position=health?.score>=85?'strong':'competitive';
  return `${property.address||property.name} has a ${position} industrial profile. `+
    `${spotlight?.competitiveProperties?.length||0} nearby competitors and `+
    `${spotlight?.requirements?.length||0} matching requirements define the immediate opportunity.`;
}

function scoreFactor(label,score,detail){
  return freeze({
    label,
    score:Math.round(Math.max(0,Math.min(100,score))),
    detail
  });
}

function scale(value,min,max){
  const numeric=Number(value||0);
  return ((numeric-min)/(max-min))*100;
}

function haversineMiles(a,b){
  if(
    a.lat==null||a.lng==null||
    b.lat==null||b.lng==null
  )return Infinity;

  const earthRadius=3958.8;
  const toRadians=value=>value*Math.PI/180;
  const dLat=toRadians(b.lat-a.lat);
  const dLng=toRadians(b.lng-a.lng);
  const lat1=toRadians(a.lat);
  const lat2=toRadians(b.lat);

  const h=
    Math.sin(dLat/2)**2+
    Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;

  return 2*earthRadius*Math.asin(Math.sqrt(h));
}
