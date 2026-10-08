const freeze=value=>Object.freeze(value);

export function buildExecutiveBriefing({
  property,
  market={},
  requirements=[],
  competitors=[],
  comparables=[]
}={}){
  if(!property)throw new Error('property is required');

  const bullets=[
    `${Number(property.buildingSf||0).toLocaleString()} SF institutional industrial facility`,
    property.clearHeightFt?`${property.clearHeightFt}′ clear height`:'Clear height requires confirmation',
    property.powerAmps?`${Number(property.powerAmps).toLocaleString()} amps available`:'Power requires confirmation',
    property.owner?`${property.owner} ownership`:'Ownership requires confirmation',
    `${competitors.length} active competitive properties`,
    `${requirements.length} matching tenant requirements`,
    `${comparables.length} relevant comparable transactions`
  ];

  const headline=`${property.address||property.name} is a ${classifyPosition(property,market,requirements,competitors)} opportunity in ${property.submarket||property.city||'its market'}.`;

  return freeze({
    headline,
    bullets:freeze(bullets),
    marketVacancy:market.vacancyRate??null,
    askingRate:market.askingRate??null,
    outlook:deriveOutlook({property,market,requirements,competitors}),
    confidencePct:calculateConfidence(property,market,comparables)
  });
}

export function buildOpportunityEngine({
  property,
  requirements=[],
  neighbors=[],
  assignments=[],
  ownerPortfolio=[]
}={}){
  const opportunities=[];

  for(const requirement of requirements){
    const fit=requirementFit(property,requirement);
    if(fit>=70){
      opportunities.push(opportunity(
        'TENANT_MATCH',
        `${requirement.company||'Active tenant requirement'} matches the property`,
        `${fit}% fit based on size, geography, clear height, and power.`,
        fit
      ));
    }
  }

  for(const neighbor of neighbors){
    if(neighbor.relationshipType==='ADJOINING'&&['AVAILABLE','VACANT'].includes(neighbor.property?.status)){
      opportunities.push(opportunity(
        'ADJACENT_EXPANSION',
        `${neighbor.property.address} may create an expansion or assemblage opportunity`,
        neighbor.sharedBoundaryFeet
          ?`${neighbor.sharedBoundaryFeet.toLocaleString()} feet of shared boundary.`
          :'Adjoining parcel is available.',
        88
      ));
    }

    if(neighbor.property?.owner&&neighbor.property.owner===property.owner){
      opportunities.push(opportunity(
        'COMMON_OWNERSHIP',
        'Common ownership exists nearby',
        'Coordinated leasing, repositioning, or portfolio strategy may be possible.',
        82
      ));
    }
  }

  if(Number(property.powerAmps||0)>=4000){
    opportunities.push(opportunity(
      'POWER_ADVANTAGE',
      'High-power industrial profile',
      `${Number(property.powerAmps).toLocaleString()} amps supports advanced manufacturing and aerospace demand.`,
      90
    ));
  }

  if(assignments.some(item=>item.propertyId===property.id)){
    opportunities.push(opportunity(
      'ACTIVE_ASSIGNMENT',
      'Active assignment intelligence is available',
      'Inquiry history, competition, comparables, and client reporting can be opened immediately.',
      95
    ));
  }

  if(ownerPortfolio.length>=3){
    opportunities.push(opportunity(
      'OWNER_PORTFOLIO',
      `${property.owner} has a meaningful nearby portfolio`,
      `${ownerPortfolio.length} governed assets support portfolio-level outreach and strategy.`,
      80
    ));
  }

  return freeze(opportunities.sort((a,b)=>b.score-a.score));
}

export function buildRiskEngine({
  property,
  market={},
  competitors=[],
  comparables=[],
  constructionPipeline=[]
}={}){
  const risks=[];

  if((market.vacancyRate??0)>=7){
    risks.push(risk(
      'VACANCY_PRESSURE',
      'Elevated submarket vacancy',
      `Vacancy is ${market.vacancyRate}%, increasing competitive pressure.`,
      78
    ));
  }

  const newerCompetitors=competitors.filter(
    item=>Number(item.yearBuilt||0)>Number(property.yearBuilt||0)
  );
  if(newerCompetitors.length){
    risks.push(risk(
      'NEWER_COMPETITION',
      `${newerCompetitors.length} newer competitor${newerCompetitors.length===1?'':'s'}`,
      'Newer buildings may compete on image, efficiency, and tenant improvement requirements.',
      72
    ));
  }

  if(constructionPipeline.length){
    risks.push(risk(
      'PIPELINE',
      `${constructionPipeline.length} pipeline project${constructionPipeline.length===1?'':'s'} may add supply`,
      'New deliveries may affect pricing, concessions, and absorption.',
      75
    ));
  }

  if(property.askingRate&&market.askingRate&&property.askingRate>market.askingRate*1.08){
    risks.push(risk(
      'PRICING',
      'Asking rate is above governed market context',
      `Property ask exceeds market asking rate by more than 8%.`,
      84
    ));
  }

  if(!property.clearHeightFt||!property.powerAmps){
    risks.push(risk(
      'DATA_GAP',
      'Material specifications require confirmation',
      'Missing clear height or power reduces confidence in matching and competitive analysis.',
      66
    ));
  }

  if(!comparables.length){
    risks.push(risk(
      'EVIDENCE_GAP',
      'Comparable evidence is limited',
      'Pricing and positioning conclusions should be reviewed before client use.',
      60
    ));
  }

  return freeze(risks.sort((a,b)=>b.score-a.score));
}

export function buildRecommendedActions({
  property,
  opportunities=[],
  risks=[],
  requirements=[],
  assignment
}={}){
  const actions=[];

  const topRequirement=requirements
    .map(item=>({item,fit:requirementFit(property,item)}))
    .sort((a,b)=>b.fit-a.fit)[0];

  if(topRequirement?.fit>=70){
    actions.push(action(
      'CONTACT_REQUIREMENT',
      `Contact ${topRequirement.item.company||'top matching requirement'}`,
      `Requirement fit is ${topRequirement.fit}%.`,
      'TODAY',
      100
    ));
  }

  if(risks.some(item=>item.type==='PRICING')){
    actions.push(action(
      'REVIEW_PRICING',
      'Review asking rate and concession strategy',
      'Current ask may be above supported market context.',
      'TODAY',
      95
    ));
  }

  if(opportunities.some(item=>item.type==='ADJACENT_EXPANSION')){
    actions.push(action(
      'REVIEW_NEIGHBORS',
      'Review adjoining parcel opportunity',
      'Expansion or assemblage potential was identified.',
      'THIS_WEEK',
      88
    ));
  }

  if(assignment){
    actions.push(action(
      'OPEN_ASSIGNMENT',
      'Open active assignment workspace',
      'Review inquiry pipeline, competition, comparables, and report readiness.',
      'TODAY',
      92
    ));
  }else{
    actions.push(action(
      'CREATE_ASSIGNMENT',
      'Create an assignment from this property',
      'Convert research into governed execution.',
      'WHEN_READY',
      75
    ));
  }

  actions.push(action(
    'GENERATE_PACKAGE',
    'Generate property intelligence package',
    'Create an evidence-backed package for internal or client review.',
    'THIS_WEEK',
    70
  ));

  return freeze(actions.sort((a,b)=>b.priority-a.priority));
}

export function buildOwnerIntelligence({
  property,
  ownerPortfolio=[],
  assignments=[]
}={}){
  const owner=property?.owner||'Unknown Owner';
  const totalSf=ownerPortfolio.reduce((sum,item)=>sum+Number(item.buildingSf||0),0);
  const availableSf=ownerPortfolio
    .filter(item=>['AVAILABLE','VACANT','UNDER CONSTRUCTION'].includes(item.status))
    .reduce((sum,item)=>sum+Number(item.buildingSf||0),0);

  return freeze({
    owner,
    assetCount:ownerPortfolio.length,
    totalSf,
    availableSf,
    activeAssignments:assignments.filter(item=>item.client===owner).length,
    nearbyAssets:freeze(ownerPortfolio.filter(item=>item.id!==property.id)),
    summary:`${owner} controls ${ownerPortfolio.length} governed asset${ownerPortfolio.length===1?'':'s'} totaling ${totalSf.toLocaleString()} SF, with ${availableSf.toLocaleString()} SF available or under construction.`
  });
}

export function buildScopedPropertyCommand({
  input,
  property
}={}){
  const raw=String(input||'').trim();
  const lower=raw.toLowerCase();
  const actions=[];

  if(lower.includes('opportun'))actions.push('OPEN_OPPORTUNITIES');
  if(lower.includes('risk'))actions.push('OPEN_RISKS');
  if(lower.includes('owner'))actions.push('OPEN_OWNER');
  if(lower.includes('timeline'))actions.push('OPEN_TIMELINE');
  if(lower.includes('neighbor'))actions.push('OPEN_NEIGHBORS');
  if(lower.includes('compar'))actions.push('OPEN_COMPARABLES');
  if(lower.includes('requirement'))actions.push('OPEN_REQUIREMENTS');
  if(lower.includes('assignment'))actions.push('OPEN_ASSIGNMENT');

  return freeze({
    raw,
    propertyId:property?.id||null,
    propertyAddress:property?.address||null,
    scoped:true,
    actions:freeze(actions.length?actions:['ANSWER_PROPERTY_QUESTION'])
  });
}

export function requirementFit(property,requirement){
  if(!property||!requirement)return 0;
  if(requirement.submarket&&requirement.submarket!==property.submarket)return 0;
  if(requirement.minSf&&property.buildingSf<requirement.minSf)return 0;
  if(requirement.maxSf&&property.buildingSf>requirement.maxSf)return 0;
  if(requirement.minClearHeightFt&&(property.clearHeightFt||0)<requirement.minClearHeightFt)return 0;
  if(requirement.minPowerAmps&&(property.powerAmps||0)<requirement.minPowerAmps)return 0;

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

function classifyPosition(property,market,requirements,competitors){
  let score=50;
  if(Number(property.powerAmps||0)>=4000)score+=15;
  if(Number(property.clearHeightFt||0)>=36)score+=10;
  if(requirements.length)score+=15;
  if(competitors.length<=5)score+=10;
  if((market.vacancyRate??10)<5)score+=10;
  return score>=85?'high-priority':score>=70?'strong':'competitive';
}

function deriveOutlook({property,market,requirements,competitors}){
  const demand=requirements.length*10;
  const physical=(property.clearHeightFt>=36?15:0)+(property.powerAmps>=4000?15:0);
  const pressure=Math.min(30,competitors.length*3)+(market.vacancyRate??0);
  const net=demand+physical-pressure;
  return net>=20?'STRONG':net>=5?'POSITIVE':'WATCH';
}

function calculateConfidence(property,market,comparables){
  return Math.min(
    99,
    70+
    (property.buildingSf?5:0)+
    (property.clearHeightFt?5:0)+
    (property.powerAmps?5:0)+
    (property.owner?5:0)+
    (market.vacancyRate!=null?4:0)+
    (comparables.length?5:0)
  );
}

function opportunity(type,title,detail,score){
  return freeze({type,title,detail,score});
}
function risk(type,title,detail,score){
  return freeze({type,title,detail,score});
}
function action(type,title,detail,timing,priority){
  return freeze({type,title,detail,timing,priority});
}
