const freeze=value=>Object.freeze(value);

export const ASSIGNMENT_STATUSES=freeze(['DRAFT','ACTIVE','CLOSED','ARCHIVED']);
export const ASSIGNMENT_TYPES=freeze([
  'LISTING','TENANT_REP','BUYER_REP','DEVELOPMENT','INVESTMENT_SALE','LAND','CONSULTING'
]);

export const INITIAL_ASSIGNMENT_PORTFOLIO=freeze([
  freeze({
    id:'A-BROOKFIELD',
    name:'Locust Gateway Logistics Center',
    client:'Brookfield',
    type:'LISTING',
    status:'ACTIVE',
    city:'Rialto',
    submarket:'Inland Empire West',
    propertyId:'P-IEW-201',
    nextCallAt:'2026-08-06T10:00:00-07:00',
    unreadChanges:3,
    openTasks:4,
    activatedAt:'2026-06-01T09:00:00-07:00',
    criteriaVersion:3
  }),
  freeze({
    id:'A-LOWELL',
    name:'Lowell Logistics Center',
    client:'Brookfield',
    type:'LISTING',
    status:'ACTIVE',
    city:'Rialto',
    submarket:'Inland Empire West',
    propertyId:'P-IEW-202',
    nextCallAt:'2026-08-05T14:00:00-07:00',
    unreadChanges:2,
    openTasks:3,
    activatedAt:'2026-05-20T09:00:00-07:00',
    criteriaVersion:2
  }),
  freeze({
    id:'A-MEROLA',
    name:'Merola Tile Requirement',
    client:'Merola Tile',
    type:'TENANT_REP',
    status:'ACTIVE',
    city:'Carson',
    submarket:'South Bay',
    nextCallAt:'2026-08-07T09:30:00-07:00',
    unreadChanges:1,
    openTasks:2,
    activatedAt:'2026-07-01T09:00:00-07:00',
    criteriaVersion:1
  }),
  freeze({
    id:'A-DRAFT-1',
    name:'New Listing Setup',
    client:'Unassigned',
    type:'LISTING',
    status:'DRAFT',
    city:'',
    submarket:'',
    unreadChanges:0,
    openTasks:5,
    createdAt:'2026-08-04T10:00:00-07:00',
    criteriaVersion:0
  }),
  freeze({
    id:'A-CLOSED-1',
    name:'Harvill Industrial',
    client:'Private Owner',
    type:'LISTING',
    status:'CLOSED',
    city:'Perris',
    submarket:'Inland Empire East',
    outcome:'LEASED',
    closedAt:'2026-06-28T16:00:00-07:00',
    transactionSf:402000,
    daysActive:147,
    inquiries:14,
    tours:6,
    proposals:2
  }),
  freeze({
    id:'A-ARCHIVE-1',
    name:'South Bay Manufacturing',
    client:'Institutional Owner',
    type:'LISTING',
    status:'ARCHIVED',
    city:'Torrance',
    submarket:'South Bay',
    outcome:'LEASED',
    archivedAt:'2026-04-15T12:00:00-07:00',
    transactionSf:188000,
    daysActive:113,
    inquiries:9,
    tours:4,
    proposals:1
  })
]);

export function createAssignment(input={}){
  for(const key of ['name','client','type']){
    if(!input[key])throw new Error(`Missing assignment field: ${key}`);
  }
  if(!ASSIGNMENT_TYPES.includes(input.type))throw new Error(`Unsupported assignment type: ${input.type}`);

  return freeze({
    id:input.id||`A-${Date.now()}`,
    name:input.name,
    client:input.client,
    type:input.type,
    status:input.status||'DRAFT',
    city:input.city||'',
    submarket:input.submarket||'',
    propertyId:input.propertyId||'',
    leadBroker:input.leadBroker||'',
    nextCallAt:input.nextCallAt||'',
    reportCadence:input.reportCadence||'BIWEEKLY',
    competitionCriteria:freeze(input.competitionCriteria||{}),
    comparableCriteria:freeze(input.comparableCriteria||{}),
    createdAt:input.createdAt||new Date().toISOString(),
    unreadChanges:0,
    openTasks:0,
    criteriaVersion:1
  });
}

export function transitionAssignment(assignment,toStatus,metadata={}){
  if(!ASSIGNMENT_STATUSES.includes(toStatus))throw new Error(`Invalid assignment status: ${toStatus}`);
  const from=assignment.status;
  const allowed={
    DRAFT:['ACTIVE','ARCHIVED'],
    ACTIVE:['CLOSED','ARCHIVED'],
    CLOSED:['ACTIVE','ARCHIVED'],
    ARCHIVED:['ACTIVE']
  };
  if(!allowed[from]?.includes(toStatus))throw new Error(`Invalid transition ${from} -> ${toStatus}`);

  const occurredAt=metadata.occurredAt||new Date().toISOString();
  return freeze({
    assignment:freeze({
      ...assignment,
      status:toStatus,
      activatedAt:toStatus==='ACTIVE'?occurredAt:assignment.activatedAt,
      closedAt:toStatus==='CLOSED'?occurredAt:assignment.closedAt,
      archivedAt:toStatus==='ARCHIVED'?occurredAt:assignment.archivedAt,
      outcome:metadata.outcome||assignment.outcome,
      closeReason:metadata.closeReason||assignment.closeReason
    }),
    event:freeze({
      id:`ALE-${assignment.id}-${occurredAt}`,
      assignmentId:assignment.id,
      type:'ASSIGNMENT_STATUS_CHANGED',
      fromStatus:from,
      toStatus,
      occurredAt,
      actor:metadata.actor||'CURRENT_USER',
      reason:metadata.reason||''
    })
  });
}

export function previewActivation(assignment,context={}){
  const criteria=assignment.competitionCriteria||{};
  const comparable=assignment.comparableCriteria||{};
  return freeze({
    assignmentId:assignment.id,
    competitionCount:Number(context.competitionCount||0),
    comparableCount:Number(context.comparableCount||0),
    matchingRequirements:Number(context.matchingRequirements||0),
    missingFields:freeze([
      !assignment.propertyId?'Subject property':null,
      !assignment.submarket?'Submarket':null,
      !criteria.minSf?'Competition minimum SF':null,
      !criteria.maxSf?'Competition maximum SF':null,
      !comparable.monthsBack?'Comparable lookback':null
    ].filter(Boolean)),
    ready:
      Boolean(assignment.propertyId&&assignment.submarket&&criteria.minSf&&criteria.maxSf&&comparable.monthsBack)
  });
}

export function buildArchivedAnalytics(assignments){
  const completed=assignments.filter(item=>['CLOSED','ARCHIVED'].includes(item.status));
  const sum=(key)=>completed.reduce((total,item)=>total+Number(item[key]||0),0);
  return freeze({
    assignmentCount:completed.length,
    transactionSf:sum('transactionSf'),
    averageDaysActive:completed.length?Math.round(sum('daysActive')/completed.length):0,
    inquiries:sum('inquiries'),
    tours:sum('tours'),
    proposals:sum('proposals'),
    inquiryToTourPct:sum('inquiries')?Math.round(sum('tours')/sum('inquiries')*100):0,
    tourToProposalPct:sum('tours')?Math.round(sum('proposals')/sum('tours')*100):0
  });
}

export function appendLifecycleEvent(history,event){
  if(history.some(item=>item.id===event.id))return freeze(history);
  return freeze([...history,event].sort((a,b)=>a.occurredAt.localeCompare(b.occurredAt)));
}
