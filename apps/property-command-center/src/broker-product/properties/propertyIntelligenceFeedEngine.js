const freeze=value=>Object.freeze(value);

export const PROPERTY_FEED_EVENT_TYPES=freeze([
  'COMPETITION_CHANGED',
  'COMPARABLE_ADDED',
  'REQUIREMENT_MATCHED',
  'INQUIRY_ADDED',
  'MARKETING_UPDATED',
  'OWNERSHIP_CHANGED',
  'PROPERTY_DATA_UPDATED'
]);

export const SAMPLE_PROPERTY_FEED=freeze([
  freeze({
    id:'PFE-001',
    propertyId:'P-IEW-201',
    type:'COMPARABLE_ADDED',
    occurredAt:'2026-08-06T08:12:00-07:00',
    title:'New 712,000 SF lease comparable recorded',
    summary:'A new large-format Inland Empire West lease comparable entered the governed comparable set.',
    whyItMatters:'The transaction supports maintaining current pricing discipline for modern Class A product.',
    recommendation:'Add the comparable to the next ownership report and pricing discussion.',
    confidence:'HIGH',
    confidencePct:96,
    evidenceIds:freeze(['EV-COMP-712']),
    assignmentIds:freeze(['A-BROOKFIELD']),
    status:'NEW',
    category:'COMPARABLES'
  }),
  freeze({
    id:'PFE-002',
    propertyId:'P-IEW-201',
    type:'REQUIREMENT_MATCHED',
    occurredAt:'2026-08-06T07:41:00-07:00',
    title:'Confidential aerospace requirement matched',
    summary:'A 600,000-725,000 SF requirement with high power and 40-foot clear-height needs entered the market.',
    whyItMatters:'The subject property satisfies the requirement size, clear height, power, and Inland Empire geography.',
    recommendation:'Initiate broker outreach and attach the requirement to the Brookfield assignment.',
    confidence:'HIGH',
    confidencePct:94,
    evidenceIds:freeze(['EV-REQ-AERO-94']),
    assignmentIds:freeze(['A-BROOKFIELD']),
    fitScore:94,
    status:'NEW',
    category:'REQUIREMENTS'
  }),
  freeze({
    id:'PFE-003',
    propertyId:'P-IEW-201',
    type:'COMPETITION_CHANGED',
    occurredAt:'2026-08-05T15:20:00-07:00',
    title:'Slover Logistics Center reduced asking rate',
    summary:'The competitive property reduced its asking rate from $1.20 to $1.16 NNN.',
    whyItMatters:'The reduction increases near-term pricing pressure within the governed 600,000-800,000 SF competitive set.',
    recommendation:'Review positioning before the next ownership call and monitor prospect feedback.',
    confidence:'HIGH',
    confidencePct:98,
    evidenceIds:freeze(['EV-RATE-SLOVER']),
    assignmentIds:freeze(['A-BROOKFIELD']),
    status:'UPDATED',
    category:'COMPETITION'
  }),
  freeze({
    id:'PFE-004',
    propertyId:'P-IEW-201',
    type:'INQUIRY_ADDED',
    occurredAt:'2026-08-05T13:05:00-07:00',
    title:'Advanced manufacturing prospect added',
    summary:'A new prospective tenant inquiry was added for 600,000-700,000 SF.',
    whyItMatters:'The prospect aligns with the property power profile and targeted industry outreach strategy.',
    recommendation:'Qualify timing, use, and decision process within two business days.',
    confidence:'MEDIUM',
    confidencePct:84,
    evidenceIds:freeze(['EV-INQ-AM-01']),
    assignmentIds:freeze(['A-BROOKFIELD']),
    status:'NEW',
    category:'INQUIRIES'
  }),
  freeze({
    id:'PFE-005',
    propertyId:'P-IEW-201',
    type:'MARKETING_UPDATED',
    occurredAt:'2026-08-05T10:30:00-07:00',
    title:'Drone and BTS marketing moved into production',
    summary:'Aerial footage and build-to-suit marketing assets advanced from planned to in production.',
    whyItMatters:'The updated content should strengthen outreach to large users evaluating construction-stage opportunities.',
    recommendation:'Confirm delivery schedule and incorporate finished assets into the next broker campaign.',
    confidence:'HIGH',
    confidencePct:99,
    evidenceIds:freeze(['EV-MKT-DRONE']),
    assignmentIds:freeze(['A-BROOKFIELD']),
    status:'UPDATED',
    category:'MARKETING'
  }),
  freeze({
    id:'PFE-006',
    propertyId:'P-IEW-201',
    type:'PROPERTY_DATA_UPDATED',
    occurredAt:'2026-08-04T16:10:00-07:00',
    title:'Power capacity confirmed at up to 8,000 amps',
    summary:'The governed property record was updated to reflect confirmed power capacity.',
    whyItMatters:'The confirmed capacity materially improves fit for advanced manufacturing, aerospace, and automation-intensive users.',
    recommendation:'Refresh property marketing and requirement matching using the confirmed power value.',
    confidence:'HIGH',
    confidencePct:100,
    evidenceIds:freeze(['EV-PROP-POWER']),
    assignmentIds:freeze(['A-BROOKFIELD']),
    status:'UPDATED',
    category:'PROPERTY'
  })
]);

export function buildPropertyIntelligenceFeed({
  propertyId,
  events=SAMPLE_PROPERTY_FEED,
  filters={}
}={}){
  if(!propertyId)throw new Error('propertyId is required');

  const categories=new Set(filters.categories||[]);
  const statuses=new Set(filters.statuses||[]);
  const minimumConfidence=Number(filters.minimumConfidencePct||0);
  const assignmentOnly=Boolean(filters.assignmentOnly);

  const filtered=events
    .filter(event=>event.propertyId===propertyId)
    .filter(event=>!categories.size||categories.has(event.category))
    .filter(event=>!statuses.size||statuses.has(event.status))
    .filter(event=>Number(event.confidencePct||0)>=minimumConfidence)
    .filter(event=>!assignmentOnly||(event.assignmentIds||[]).length>0)
    .sort((a,b)=>String(b.occurredAt).localeCompare(String(a.occurredAt)));

  return freeze({
    propertyId,
    events:freeze(filtered),
    counts:freeze({
      total:filtered.length,
      new:filtered.filter(event=>event.status==='NEW').length,
      updated:filtered.filter(event=>event.status==='UPDATED').length,
      assignmentRelevant:filtered.filter(event=>(event.assignmentIds||[]).length>0).length
    }),
    latestAt:filtered[0]?.occurredAt||null,
    categories:freeze(
      [...new Set(filtered.map(event=>event.category))].sort()
    )
  });
}

export function createPropertyFeedEvent(input={}){
  for(const key of ['propertyId','type','title','occurredAt']){
    if(!input[key])throw new Error(`Missing property feed event field: ${key}`);
  }
  if(!PROPERTY_FEED_EVENT_TYPES.includes(input.type)){
    throw new Error(`Unsupported property feed event type: ${input.type}`);
  }

  return freeze({
    id:input.id||`PFE-${Date.now()}`,
    propertyId:input.propertyId,
    type:input.type,
    occurredAt:input.occurredAt,
    title:input.title,
    summary:input.summary||'',
    whyItMatters:input.whyItMatters||'',
    recommendation:input.recommendation||'',
    confidence:input.confidence||'MEDIUM',
    confidencePct:Number(input.confidencePct||75),
    evidenceIds:freeze(input.evidenceIds||[]),
    assignmentIds:freeze(input.assignmentIds||[]),
    fitScore:input.fitScore,
    status:input.status||'NEW',
    category:input.category||'PROPERTY'
  });
}

export function appendPropertyFeedEvent(events,event){
  if(events.some(item=>item.id===event.id))return freeze(events);
  return freeze(
    [...events,event].sort((a,b)=>String(b.occurredAt).localeCompare(String(a.occurredAt)))
  );
}

export function summarizePropertyFeed(feed){
  const latest=feed.events[0];
  return freeze({
    headline:latest
      ?`${feed.counts.new} new and ${feed.counts.updated} updated property signals`
      :'No recent property intelligence',
    latestTitle:latest?.title||'',
    actionCount:feed.events.filter(event=>Boolean(event.recommendation)).length,
    evidenceCount:new Set(feed.events.flatMap(event=>event.evidenceIds||[])).size
  });
}
