import React,{useMemo,useState}from'react';
import{
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  FilePenLine,
  Sparkles
}from'lucide-react';
import{PRODUCT_REALISM,getAssignmentView}from'../product-realism/service/productRealismService.js';
import'./assignment-evidence-cards.css';import'./assignment-workspace-v1-2.css';

export default function AssignmentImpactPage(){
  const[selected,setSelected]=useState(PRODUCT_REALISM.input.assignments[0].id);
  const view=useMemo(()=>getAssignmentView(selected),[selected]);
  const assignment=view.assignment;
  const eventById=id=>view.events.find(event=>event.id===id);

  return (
    <section className="broker-page">
      <header className="broker-simple-hero pr-assignment-hero">
        <div>
          <p className="broker-kicker">Assignment intelligence</p>
          <h1>{assignment.name}</h1>
          <p>{assignment.submarket} · Next call {new Date(assignment.nextCallAt).toLocaleString()}</p>
        </div>
        <label className="pr-select light">
          <span>Assignment</span>
          <select value={selected} onChange={event=>setSelected(event.target.value)}>
            {PRODUCT_REALISM.input.assignments.map(item=>
              <option value={item.id} key={item.id}>{item.name}</option>
            )}
          </select>
        </label>
      </header>



      <div className="broker-columns">
        <main>
          <ImpactPanel
            kicker="Direct impact"
            title=""
            impacts={view.direct}
            eventById={eventById}
            assignment={assignment}
            defaultOpenCount={view.direct.length}
          />

          <ImpactPanel
            kicker="Indirect impact"
            title=""
            impacts={view.indirect}
            eventById={eventById}
            assignment={assignment}
            defaultOpenCount={1}
          />
        </main>

        <aside>
          <UpcomingCallPanel assignment={assignment} view={view}/>

          <ListingReportQueue view={view} event={eventById}/>

          <section className="pr-call-card">
            <CalendarClock size={22}/>
            <p className="broker-kicker">Call readiness</p>
            <h2>{view.recommendations.length?'Preparation required':'Ready'}</h2>
            <p>{view.recommendations.reduce((sum,item)=>sum+item.estimatedMinutes,0)} estimated minutes remain.</p>
            <button type="button"><CheckCircle2 size={15}/> Build evidence-backed call brief</button>
          </section>
        </aside>
      </div>
    </section>
  );
}

function ImpactPanel({kicker,title,impacts,eventById,assignment,defaultOpenCount}){
  return (
    <section className="broker-panel pr-evidence-panel">
      <header>
        <div><p className="broker-kicker">{kicker}</p>{title&&<h2>{title}</h2>}</div>
        <span className="pr-impact-count pr-impact-count--label">{kicker==="Direct impact"?`${impacts.length} High Priority`:`${impacts.length} Market Signals`}</span>
      </header>
      <div className="pr-evidence-list">
        {impacts.length===0
          ? <div className="pr-empty-impact">No meaningful changes detected for this period.</div>
          : impacts.map((impact,index)=>
              <EvidenceImpactCard
                key={impact.id}
                impact={impact}
                event={eventById(impact.eventId)}
                assignment={assignment}
                defaultOpen={index<defaultOpenCount}
              />
            )}
      </div>
    </section>
  );
}

function EvidenceImpactCard({impact,event,assignment,defaultOpen}){
  const summary=buildEventSummary(event,assignment,impact);
  const Icon=impact.classification==='DIRECT'?CircleAlert:Sparkles;

  return (
    <details className={`pr-evidence-card ${impact.classification.toLowerCase()}`} open={defaultOpen}>
      <summary>
        <span className="broker-icon"><Icon size={15}/></span>
        <div className="pr-evidence-card__title">
          <strong>{summary.heading}</strong>
          <small>{summary.oneLine}</small>
        </div>
        <div className="pr-evidence-card__meta">
          <span>Relevance {impact.relevanceScore}</span>
          <ChevronDown size={17}/>
        </div>
      </summary>

      <div className="pr-evidence-card__body">
        <section className="pr-fact-grid" aria-label="Key event facts">
          {summary.facts.map(([label,value])=>
            <div key={`${label}-${value}`}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          )}
        </section>

        <section className="pr-assignment-implication">
          <span>Why this matters to {assignment.name}</span>
          <p>{summary.implication}</p>
        </section>

        <footer className="pr-evidence-card__footer">
          <div>
            <span>{event?.confidencePct??'—'}% confidence</span>
            <span>{impact.evidenceIds?.length??0} linked evidence item{impact.evidenceIds?.length===1?'':'s'}</span>
            <span>{formatDate(event?.occurredAt)}</span>
          </div>
          <button type="button">
            Open source evidence <ArrowRight size={15}/>
          </button>
        </footer>
      </div>
    </details>
  );
}

function buildEventSummary(event,assignment,impact){
  if(!event){
    return {
      heading:'Market event',
      oneLine:impact.explanation,
      facts:[['Classification',impact.classification],['Relevance',impact.relevanceScore]],
      implication:impact.explanation
    };
  }

  const input=PRODUCT_REALISM.input;
  const entityIds=event.entityIds||[];
  const property=input.properties.find(item=>entityIds.includes(item.id));
  const comparable=input.comparables.find(item=>entityIds.includes(item.id));
  const requirement=input.requirements.find(item=>entityIds.includes(item.id));
  const relationship=input.relationships.find(item=>entityIds.includes(item.propertyId)||entityIds.includes(item.companyId));

  if(event.type==='RATE_CHANGED'&&property){
    const delta=property.askingRate-property.previousAskingRate;
    const pct=property.previousAskingRate?delta/property.previousAskingRate*100:0;
    return {
      heading:`${property.id} — Asking rate ${delta<0?'reduced':'increased'}`,
      oneLine:`$${property.previousAskingRate.toFixed(2)} to $${property.askingRate.toFixed(2)} NNN · ${formatSignedPercent(pct)}`,
      facts:[
        ['Property',property.id],
        ['Previous rate',`$${property.previousAskingRate.toFixed(2)} NNN`],
        ['Current rate',`$${property.askingRate.toFixed(2)} NNN`],
        ['Change',`${delta>=0?'+':''}$${delta.toFixed(2)} · ${formatSignedPercent(pct)}`],
        ['Building size',`${property.sf.toLocaleString()} SF`],
        ['Power',`${property.powerAmps.toLocaleString()} amps`]
      ],
      implication:`This rate change directly affects the assignment’s competitive positioning. Review pricing and client talking points before the next call.`
    };
  }

  if(event.type==='LEASE_COMPARABLE_ADDED'&&comparable){
    return {
      heading:`${comparable.propertyId} — Lease comparable`,
      oneLine:`${comparable.buildingSf.toLocaleString()} SF · $${comparable.rate.toFixed(2)} NNN · ${comparable.submarket}`,
      facts:[
        ['Property',comparable.propertyId],
        ['Transaction','Lease'],
        ['Building size',`${comparable.buildingSf.toLocaleString()} SF`],
        ['Lease rate',`$${comparable.rate.toFixed(2)} NNN`],
        ['Submarket',comparable.submarket],
        ['Closed',formatDate(comparable.closedAt)]
      ],
      implication:comparable.submarket===assignment.submarket
        ? `This transaction provides current pricing evidence within the assignment’s submarket and should be considered in the next client discussion and report.`
        : `This transaction provides broader market pricing context. Its relevance is indirect, but it may influence client expectations and comparable selection.`
    };
  }

  if(event.type==='SALE_COMPARABLE_ADDED'&&comparable){
    return {
      heading:`${comparable.propertyId} — Sale comparable`,
      oneLine:`${comparable.buildingSf.toLocaleString()} SF · $${comparable.salePricePsf.toLocaleString()}/SF · ${comparable.submarket}`,
      facts:[
        ['Property',comparable.propertyId],
        ['Transaction','Sale'],
        ['Building size',`${comparable.buildingSf.toLocaleString()} SF`],
        ['Sale price',`$${comparable.salePricePsf.toLocaleString()}/SF`],
        ['Submarket',comparable.submarket],
        ['Closed',formatDate(comparable.closedAt)]
      ],
      implication:comparable.submarket===assignment.submarket
        ? `This sale establishes a current valuation benchmark in the assignment’s submarket and may affect owner expectations or investment positioning.`
        : `This sale is a broader valuation signal. Monitor it when framing pricing, capital-market conditions, or client expectations.`
    };
  }

  if(event.type==='REQUIREMENT_CREATED'&&requirement){
    const matchingProperties=input.properties.filter(property=>
      property.submarket===requirement.submarket&&
      property.available&&
      property.sf>=requirement.minSf&&
      property.sf<=requirement.maxSf&&
      property.powerAmps>=requirement.minPowerAmps
    );

    return {
      heading:`New ${requirement.industry} requirement — ${requirement.submarket}`,
      oneLine:`${requirement.minSf.toLocaleString()}–${requirement.maxSf.toLocaleString()} SF · ${requirement.minPowerAmps.toLocaleString()}+ amps · ${matchingProperties.length} current match${matchingProperties.length===1?'':'es'}`,
      facts:[
        ['Industry',requirement.industry],
        ['Required size',`${requirement.minSf.toLocaleString()}–${requirement.maxSf.toLocaleString()} SF`],
        ['Minimum power',`${requirement.minPowerAmps.toLocaleString()} amps`],
        ['Submarket',requirement.submarket],
        ['Status',requirement.status],
        ['Current matches',String(matchingProperties.length)]
      ],
      implication:assignment.requirementIds?.includes(requirement.id)
        ? `This is the assignment’s governed requirement. The current property set should be refreshed against its size and power criteria.`
        : `This requirement may create a demand path for qualifying assignment properties and should be discussed when evaluating urgency and positioning.`
    };
  }

  if((event.type==='BUILDING_LEASED'||event.type==='AVAILABILITY_CHANGED')&&property){
    return {
      heading:`${property.id} — Availability changed`,
      oneLine:`${property.previousStatus} to ${property.status} · ${property.sf.toLocaleString()} SF · ${property.submarket}`,
      facts:[
        ['Property',property.id],
        ['Previous status',property.previousStatus],
        ['Current status',property.status],
        ['Building size',`${property.sf.toLocaleString()} SF`],
        ['Asking rate',`$${property.askingRate.toFixed(2)} NNN`],
        ['Power',`${property.powerAmps.toLocaleString()} amps`]
      ],
      implication:`The competitive or qualifying property set changed. Update comparisons, shortlist logic, and client materials before the next discussion.`
    };
  }

  if(event.type==='OWNERSHIP_RESOLVED'&&relationship){
    return {
      heading:`Ownership relationship resolved — ${relationship.propertyId}`,
      oneLine:`Governed owner link added for ${relationship.companyId}`,
      facts:[
        ['Property',relationship.propertyId],
        ['Company',relationship.companyId],
        ['Relationship','Ownership'],
        ['Created',formatDate(relationship.createdAt)]
      ],
      implication:`The assignment now has a clearer ownership and outreach path. Confirm that contact strategy and reporting records reflect the resolved relationship.`
    };
  }

  return {
    heading:event.title,
    oneLine:event.detail,
    facts:[
      ['Event type',event.type.replaceAll('_',' ')],
      ['Submarket',event.submarket],
      ['Severity',event.severity],
      ['Relevance',String(impact.relevanceScore)]
    ],
    implication:impact.explanation
  };
}

function formatDate(value){
  if(!value)return 'Date unavailable';
  const date=new Date(value);
  return Number.isNaN(date.getTime())?'Date unavailable':date.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
}

function formatSignedPercent(value){
  const rounded=Math.abs(value).toFixed(1);
  return `${value>=0?'+':'-'}${rounded}%`;
}


function UpcomingCallPanel({assignment,view}){
  const items=buildCallAgenda(view);
  const minutes=view.recommendations.reduce((sum,item)=>sum+item.estimatedMinutes,0);
  return <section className="broker-panel pr-upcoming-call">
    <header><div><p className="broker-kicker">Upcoming call</p><h2>{formatCallDate(assignment.nextCallAt)}</h2></div></header>
    <div className="pr-upcoming-call__body">
      <div className="pr-agenda-heading"><strong>Today's preparation</strong><small>{minutes} estimated minutes</small></div>
      <div className="pr-agenda-list">{items.map(item=><label key={item}><input type="checkbox"/><span>{item}</span></label>)}</div>
      <button type="button" className="pr-build-brief"><CheckCircle2 size={15}/> Build AI Call Brief</button>
    </div>
  </section>;
}
function ListingReportQueue({view,event}){
  const items=[];
  for(const impact of [...view.direct,...view.indirect]){
    const marketEvent=event(impact.eventId);
    if(!marketEvent)continue;
    if(marketEvent.type==='RATE_CHANGED')items.push(['Competition',marketEvent.title,marketEvent.detail]);
    if(marketEvent.type==='LEASE_COMPARABLE_ADDED'||marketEvent.type==='SALE_COMPARABLE_ADDED')items.push(['Comparable Transactions',marketEvent.title,marketEvent.detail]);
    if(marketEvent.type==='REQUIREMENT_CREATED')items.push(['Market Overview',marketEvent.title,marketEvent.detail]);
  }
  const seen=new Set();
  const unique=items.filter(item=>{const key=item[0]+item[1];if(seen.has(key))return false;seen.add(key);return true});
  return <section className="broker-panel pr-report-panel">
    <header><div><p className="broker-kicker">Listing report</p><h2>Update queue</h2></div><span className="pr-impact-count">{unique.length}</span></header>
    <div className="pr-report-queue">{unique.map(([section,title,detail])=><article key={section+title}><FilePenLine size={15}/><div><strong>{section}</strong><span>{title}</span><small>{detail}</small></div><button type="button">Draft</button></article>)}</div>
  </section>;
}
function buildCallAgenda(view){
  const items=[];
  for(const impact of view.direct){
    const event=view.events.find(item=>item.id===impact.eventId);
    if(event?.type==='RATE_CHANGED')items.push('Review competitor rate reduction');
    else if(event?.type==='LEASE_COMPARABLE_ADDED')items.push('Review new lease comparable');
    else if(event?.type==='SALE_COMPARABLE_ADDED')items.push('Review new sale comparable');
    else if(event?.type==='REQUIREMENT_CREATED')items.push('Review new requirement and matches');
  }
  if(view.indirect.some(impact=>view.events.find(event=>event.id===impact.eventId)?.type==='LEASE_COMPARABLE_ADDED'))items.push('Confirm pricing strategy');
  items.push('Finalize client talking points','Confirm decisions needed from client');
  return [...new Set(items)].slice(0,5);
}
function formatCallDate(value){
  const date=new Date(value);
  return date.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})+' · '+date.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});
}

function Panel({kicker,title,children}){
  return <section className="broker-panel"><header><div><p className="broker-kicker">{kicker}</p>{title&&<h2>{title}</h2>}</div></header><div className="broker-list">{children}</div></section>;
}
