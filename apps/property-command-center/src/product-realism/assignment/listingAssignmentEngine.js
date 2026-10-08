const freeze=value=>Object.freeze(value);

export const LOCUST_ASSIGNMENT=freeze({
  id:'A-BROOKFIELD',
  name:'Locust Gateway Logistics Center',
  client:'Brookfield Properties',
  owner:'Brookfield Properties',
  type:'LISTING',
  status:'ACTIVE',
  address:'2125 W Lowell St',
  city:'Rialto',
  state:'CA',
  buildingSf:664859,
  clearHeightFt:42,
  dockHighDoors:82,
  autoParking:265,
  trailerParking:398,
  truckCourtFt:185,
  powerAmps:8000,
  year:2027,
  constructionStatus:'UNDER CONSTRUCTION',
  facilityDescription:'Class A Industrial Distribution Facility',
  leadBroker:'Lee & Associates - City of Industry',
  assignmentStartAt:'2026-05-01T09:00:00-07:00',
  nextOwnershipCall:'2026-08-06T10:00:00-07:00',
  brochureUrl:'https://drive.google.com/file/d/1RUbzy9DcmUSN9Im9-Nyk_k9zLxyzUn3I/view',
  websiteUrl:'https://www.locustgatewaylogisticscenter.com/',
  competitionCriteria:freeze({
    minSf:600000,maxSf:800000,
    statuses:freeze(['AVAILABLE','UNDER CONSTRUCTION']),
    dealTypes:freeze(['DIRECT','SUBLEASE']),
    submarkets:freeze(['Inland Empire West','Inland Empire East'])
  }),
  comparableCriteria:freeze({
    minSf:450000,maxSf:900000,monthsBack:36,
    types:freeze(['LEASE','SALE']),
    submarkets:freeze(['Inland Empire West','Inland Empire East'])
  })
});

export const SAMPLE_ASSIGNMENT_INPUT=freeze({
  properties:freeze([
    freeze({
      id:'P-IEW-701',name:'Slover Logistics Center',
      address:'10800 Slover Ave',city:'Fontana',
      submarket:'Inland Empire West',sf:720000,
      status:'AVAILABLE',dealType:'SUBLEASE',
      askingRate:1.16,previousAskingRate:1.20,clearHeightFt:40
    }),
    freeze({
      id:'P-IEW-702',name:'North Rialto Distribution Center',
      address:'Rialto, CA',city:'Rialto',
      submarket:'Inland Empire West',sf:650000,
      status:'UNDER CONSTRUCTION',dealType:'DIRECT',
      askingRate:1.20,previousAskingRate:1.20,clearHeightFt:42
    }),
    freeze({
      id:'P-IEW-703',name:'Small Building',
      address:'Ontario, CA',city:'Ontario',
      submarket:'Inland Empire West',sf:390000,
      status:'AVAILABLE',dealType:'DIRECT'
    })
  ]),
  comparables:freeze([
    freeze({
      id:'COMP-L-701',property:'IE West Lease Comp',
      type:'LEASE',submarket:'Inland Empire West',
      buildingSf:710000,rate:1.17,closedAt:'2026-07-15'
    }),
    freeze({
      id:'COMP-S-701',property:'IE West Sale Comp',
      type:'SALE',submarket:'Inland Empire West',
      buildingSf:680000,salePricePsf:226,closedAt:'2026-06-20'
    })
  ]),
  requirements:freeze([
    freeze({
      id:'REQ-701',company:'National Logistics User',
      status:'ACTIVE',minSf:600000,maxSf:750000,
      minClearHeightFt:40,minPowerAmps:4000,
      timing:'Q1 2027',
      lastActivityAt:'2026-08-03',
      submarkets:freeze(['Inland Empire West'])
    })
  ]),
  inquiries:freeze([
    freeze({
      id:'INQ-701',assignmentId:'A-BROOKFIELD',
      company:'Prospective Tenant A',contactName:'Jane Broker',
      stage:'QUALIFIED',outcome:'ACTIVE',
      minSf:650000,maxSf:700000,timing:'Q1 2027',
      createdAt:'2026-05-14',lastActivityAt:'2026-08-03'
    }),
    freeze({
      id:'INQ-702',assignmentId:'A-BROOKFIELD',
      company:'National Retailer',contactName:'Michael Smith',
      stage:'TOUR',outcome:'ACTIVE',
      minSf:600000,maxSf:675000,timing:'Q4 2026',
      createdAt:'2026-05-28',lastActivityAt:'2026-08-02'
    }),
    freeze({
      id:'INQ-703',assignmentId:'A-BROOKFIELD',
      company:'Third-Party Logistics User',contactName:'Sarah Lee',
      stage:'LOST',outcome:'LOCATION ELIMINATED',
      minSf:625000,maxSf:725000,timing:'Immediate',
      createdAt:'2026-06-10',lastActivityAt:'2026-07-18'
    }),
    freeze({
      id:'INQ-704',assignmentId:'A-BROOKFIELD',
      company:'Advanced Manufacturing Prospect',contactName:'David Chen',
      stage:'NEW',outcome:'FOLLOW-UP REQUIRED',
      minSf:600000,maxSf:700000,timing:'Q2 2027',
      createdAt:'2026-08-01',lastActivityAt:'2026-08-04'
    })
  ]),
  marketingActivity:freeze([
    freeze({
      id:'MKT-1',activity:'Broker outreach campaign',
      status:'IN PROGRESS',
      detail:'Targeted outreach to national logistics occupiers',
      occurredAt:'2026-08-03'
    }),
    freeze({
      id:'MKT-2',activity:'Drone footage',
      status:'IN PRODUCTION',
      detail:'Aerial and BTS marketing assets in production',
      occurredAt:'2026-08-02'
    }),
    freeze({
      id:'MKT-3',activity:'Property website',
      status:'UPDATED',
      detail:'Availability and building specifications refreshed',
      occurredAt:'2026-08-01'
    }),
    freeze({
      id:'MKT-4',activity:'Advanced manufacturing outreach',
      status:'ACTIVE',
      detail:'Targeted aerospace and advanced-manufacturing prospecting',
      occurredAt:'2026-08-03'
    })
  ])
});

export function evaluateListingAssignment({
  assignment=LOCUST_ASSIGNMENT,
  properties=[],
  comparables=[],
  requirements=[],
  inquiries=[],
  marketingActivity=[]
}={}){
  const c=assignment.competitionCriteria;
  const cc=assignment.comparableCriteria;

  const competition=properties.filter(property=>
    property.sf>=c.minSf&&property.sf<=c.maxSf&&
    c.statuses.includes(property.status)&&
    c.dealTypes.includes(property.dealType)&&
    c.submarkets.includes(property.submarket)
  );

  const relevantComparables=comparables.filter(comparable=>
    comparable.buildingSf>=cc.minSf&&
    comparable.buildingSf<=cc.maxSf&&
    cc.types.includes(comparable.type)&&
    cc.submarkets.includes(comparable.submarket)
  );

  const matchingRequirements=requirements
    .filter(requirement=>
      requirement.status==='ACTIVE'&&
      requirement.minSf<=assignment.buildingSf&&
      requirement.maxSf>=assignment.buildingSf&&
      (requirement.minClearHeightFt||0)<=assignment.clearHeightFt&&
      (requirement.minPowerAmps||0)<=assignment.powerAmps
    )
    .map(requirement=>freeze({...requirement,fitScore:computeFit(assignment,requirement)}));

  const inquiryHistory=inquiries
    .filter(inquiry=>inquiry.assignmentId===assignment.id)
    .sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt)));

  const activeInquiries=inquiryHistory.filter(inquiry=>
    !['LOST','DISQUALIFIED','NO RESPONSE'].includes(inquiry.stage)
  );

  return freeze({
    assignment,
    competition:freeze(competition),
    relevantComparables:freeze(relevantComparables),
    matchingRequirements:freeze(matchingRequirements),
    inquiries:freeze(activeInquiries),
    inquiryHistory:freeze(inquiryHistory),
    marketingActivity:freeze(marketingActivity),
    counts:freeze({
      competition:competition.length,
      comparables:relevantComparables.length,
      requirements:matchingRequirements.length,
      inquiries:activeInquiries.length,
      inquiryHistory:inquiryHistory.length,
      marketingActivity:marketingActivity.length
    })
  });
}

function computeFit(assignment,requirement){
  let score=60;
  if(assignment.buildingSf>=requirement.minSf&&assignment.buildingSf<=requirement.maxSf)score+=15;
  if(assignment.clearHeightFt>=(requirement.minClearHeightFt||0))score+=10;
  if(assignment.powerAmps>=(requirement.minPowerAmps||0))score+=10;
  if(requirement.submarkets?.includes('Inland Empire West'))score+=5;
  return Math.min(100,score);
}

export function createInquiry(input={}){
  for(const key of ['company','contactName','assignmentId']){
    if(!input[key])throw new Error(`Missing inquiry field: ${key}`);
  }
  return freeze({
    id:input.id||`INQ-${Date.now()}`,
    assignmentId:input.assignmentId,
    company:input.company,
    contactName:input.contactName,
    stage:input.stage||'NEW',
    outcome:input.outcome||'ACTIVE',
    minSf:Number(input.minSf||0),
    maxSf:Number(input.maxSf||0),
    timing:input.timing||'',
    createdAt:input.createdAt||new Date().toISOString(),
    lastActivityAt:input.lastActivityAt||new Date().toISOString(),
    notes:input.notes||''
  });
}

export const LOCUST_ASSIGNMENT_VIEW=evaluateListingAssignment(SAMPLE_ASSIGNMENT_INPUT);
