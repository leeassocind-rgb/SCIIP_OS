import React,{useMemo,useState}from'react';
import{
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Building2,
  CheckCircle2,
  CircleHelp,
  FileText,
  Lightbulb,
  Search,
  Sparkles,
  Target,
  Users,
  MapPin,
  ChevronDown,
  X
}from'lucide-react';
import ExplorerMap from'../maps/ExplorerMap.jsx';
import{
  buildExecutiveBriefing,
  buildOpportunityEngine,
  buildOwnerIntelligence,
  buildRecommendedActions,
  buildRiskEngine,
  buildScopedPropertyCommand
}from'./propertyDecisionEngine.js';
import{
  buildImmediateNeighbors,
  buildNeighborIntelligence
}from'../v4_3/immediateNeighborEngine.js';
import'./explorer-v5.css';

const PROPERTIES=[
  {
    id:'P-IEW-201',
    address:'2125 W Lowell St',
    city:'Rialto',
    submarket:'Inland Empire West',
    owner:'Brookfield Properties',
    buildingSf:664859,
    clearHeightFt:42,
    powerAmps:8000,
    yearBuilt:2027,
    status:'UNDER CONSTRUCTION',
    askingRate:1.34,
    lat:34.1069,
    lng:-117.4112,
    assignment:{id:'A-BROOKFIELD',client:'Brookfield Properties',type:'LISTING'}
  },
  {
    id:'P-IEW-701',
    address:'10800 Slover Ave',
    city:'Fontana',
    submarket:'Inland Empire West',
    owner:'Institutional Owner',
    buildingSf:720000,
    clearHeightFt:40,
    powerAmps:4000,
    yearBuilt:2024,
    status:'AVAILABLE',
    lat:34.0632,
    lng:-117.5041
  },
  {
    id:'P-IEW-702',
    address:'North Rialto Distribution Center',
    city:'Rialto',
    submarket:'Inland Empire West',
    owner:'Institutional Owner',
    buildingSf:650000,
    clearHeightFt:40,
    powerAmps:4000,
    yearBuilt:2026,
    status:'UNDER CONSTRUCTION',
    lat:34.1265,
    lng:-117.3800
  },
  {
    id:'P-IEW-703',
    address:'West Lowell Industrial Land',
    city:'Rialto',
    submarket:'Inland Empire West',
    owner:'Brookfield Properties',
    buildingSf:0,
    landAcres:8.4,
    status:'VACANT',
    lat:34.1069,
    lng:-117.4280
  }
];

const REQUIREMENTS=[
  {
    id:'REQ-AERO',
    company:'Confidential Aerospace Manufacturer',
    submarket:'Inland Empire West',
    minSf:600000,
    maxSf:750000,
    preferredSf:675000,
    minClearHeightFt:40,
    minPowerAmps:4000
  },
  {
    id:'REQ-LOG',
    company:'Regional Logistics User',
    submarket:'Inland Empire West',
    minSf:500000,
    maxSf:700000,
    preferredSf:625000,
    minClearHeightFt:36
  }
];

const COMPARABLES=[
  {id:'C1',type:'LEASE_COMPARABLE',submarket:'Inland Empire West',buildingSf:712000,lat:34.088,lng:-117.447},
  {id:'C2',type:'SALE_COMPARABLE',submarket:'Inland Empire West',buildingSf:680000,lat:34.135,lng:-117.455}
];

const ASSIGNMENTS=[
  {id:'A-BROOKFIELD',propertyId:'P-IEW-201',client:'Brookfield Properties',type:'LISTING',status:'ACTIVE'}
];

const PARCEL_RELATIONSHIPS=[
  {
    subjectPropertyId:'P-IEW-201',
    neighborPropertyId:'P-IEW-703',
    direction:'WEST',
    relationshipType:'ADJOINING',
    distanceFeet:0,
    sharedBoundaryFeet:684,
    bearingDegrees:270,
    confidence:'HIGH',
    evidenceIds:['PARCEL-WEST']
  }
];

const MARKET={
  vacancyRate:7.8,
  askingRate:1.18,
  demandScore:88
};

const TABS=['Overview','Property','Market','Neighbors','Activity'];
const NEIGHBOR_FILTERS=['All','Adjacent','Across Street',"500'",'1 Mile'];

export default function ExplorerPropertyIntelligenceOS(){
  const[selectedId,setSelectedId]=useState('P-IEW-201');
  const[tab,setTab]=useState('Overview');
  const[command,setCommand]=useState('');
  const[whyOpen,setWhyOpen]=useState(false);
  const[neighborFilter,setNeighborFilter]=useState('All');
  const[neighborFocusId,setNeighborFocusId]=useState(null);
  const[compareId,setCompareId]=useState(null);
  const[actionsOpen,setActionsOpen]=useState(false);

  const property=PROPERTIES.find(item=>item.id===selectedId)||PROPERTIES[0];

  const competitors=useMemo(
    ()=>PROPERTIES.filter(item=>
      item.id!==property.id&&
      item.submarket===property.submarket&&
      ['AVAILABLE','UNDER CONSTRUCTION'].includes(item.status)
    ),
    [property.id]
  );

  const ownerPortfolio=useMemo(
    ()=>PROPERTIES.filter(item=>item.owner===property.owner),
    [property.owner]
  );

  const neighbors=useMemo(
    ()=>buildImmediateNeighbors({
      subject:property,
      properties:PROPERTIES,
      parcelRelationships:PARCEL_RELATIONSHIPS,
      maxDistanceMiles:2
    }),
    [property]
  );

  const neighborIntelligence=useMemo(
    ()=>buildNeighborIntelligence({subject:property,neighbors}),
    [property,neighbors]
  );

  const briefing=useMemo(
    ()=>buildExecutiveBriefing({
      property,
      market:MARKET,
      requirements:REQUIREMENTS,
      competitors,
      comparables:COMPARABLES
    }),
    [property,competitors]
  );

  const opportunities=useMemo(
    ()=>buildOpportunityEngine({
      property,
      requirements:REQUIREMENTS,
      neighbors:DIRECTIONS_FLAT(neighbors),
      assignments:ASSIGNMENTS,
      ownerPortfolio
    }),
    [property,neighbors,ownerPortfolio]
  );

  const risks=useMemo(
    ()=>buildRiskEngine({
      property,
      market:MARKET,
      competitors,
      comparables:COMPARABLES,
      constructionPipeline:competitors.filter(item=>item.status==='UNDER CONSTRUCTION')
    }),
    [property,competitors]
  );

  const assignment=ASSIGNMENTS.find(item=>item.propertyId===property.id)||null;

  const actions=useMemo(
    ()=>buildRecommendedActions({
      property,
      opportunities,
      risks,
      requirements:REQUIREMENTS,
      assignment
    }),
    [property,opportunities,risks,assignment]
  );

  const owner=useMemo(
    ()=>buildOwnerIntelligence({
      property,
      ownerPortfolio,
      assignments:ASSIGNMENTS
    }),
    [property,ownerPortfolio]
  );

  function runCommand(event){
    event.preventDefault();
    const parsed=buildScopedPropertyCommand({input:command,property});
    const first=parsed.actions[0];
    if(['OPEN_OPPORTUNITIES','OPEN_RISKS'].includes(first))setTab('Overview');
    else if(first==='OPEN_OWNER')setTab('Property');
    else if(first==='OPEN_TIMELINE')setTab('Activity');
    else if(first==='OPEN_ASSIGNMENT')setActionsOpen(true);
    else if(first==='OPEN_NEIGHBORS')setTab('Neighbors');
  }

  return (
    <section className="explorer-v5">
      <header className="explorer-v5__command">
        <form onSubmit={runCommand}>
          <BrainCircuit size={17}/>
          <input
            value={command}
            onChange={event=>setCommand(event.target.value)}
            placeholder={`Ask SCIIP about ${property.address}: opportunities, risks, owner, neighbors, timeline...`}
          />
          <button type="submit">Run</button>
        </form>
      </header>

      <main className="explorer-v5__workspace">
        <section className="explorer-v5__map-shell">
          <ExplorerMap
            properties={PROPERTIES}
            selectedPropertyId={property.id}
            onSelectProperty={setSelectedId}
            spotlightRadiusMiles={tab==='Neighbors'?1:5}
            neighborRelationships={tab==='Neighbors'?neighbors.relationships:[]}
            focusPropertyId={neighborFocusId}
          />

          <section className="explorer-v5__map-legend">
            <span><i className="assignment"/>Assignment</span>
            <span><i className="available"/>Available</span>
            <span><i className="construction"/>Construction</span>
            <span><i className="prospect"/>Other</span>
          </section>

          <section className="explorer-v5__spotlight-badge">
            <Target size={15}/>
            {tab==='Neighbors'?'Neighbor Intelligence · 1 mile':'5-mile Market Spotlight'}
          </section>
        </section>

        <aside className="explorer-v5__drawer">
          <header className="explorer-v5__property-header">
            <div>
              <span>Property Intelligence</span>
              <h2>{property.address}</h2>
              <p>{property.city} · {property.submarket}</p>
            </div>
            <div className="explorer-v5__header-actions">
              <button type="button" onClick={()=>setWhyOpen(true)}><CircleHelp size={15}/> Why?</button>
              <button type="button" onClick={()=>setActionsOpen(value=>!value)}>Actions <ChevronDown size={14}/></button>
            </div>
            {actionsOpen&&<div className="explorer-v5__actions-menu">
              {actions.slice(0,3).map(row=><button type="button" key={row.type}><strong>{row.title}</strong><span>{row.timing}</span></button>)}
            </div>}
          </header>

          <nav className="explorer-v5__primary-tabs">
            {TABS.map(item=><button type="button" key={item} className={tab===item?'active':''} onClick={()=>{setTab(item);setNeighborFocusId(null);}}>{item}</button>)}
          </nav>

          <div className="explorer-v5__drawer-scroll">
            {tab==='Overview'&&<OverviewView briefing={briefing} property={property} opportunities={opportunities} risks={risks} neighborIntelligence={neighborIntelligence}/>} 
            {tab==='Property'&&<PropertyView property={property} owner={owner}/>} 
            {tab==='Market'&&<MarketView property={property} competitors={competitors} comparables={COMPARABLES} market={MARKET}/>} 
            {tab==='Neighbors'&&<NeighborsView subject={property} neighbors={neighbors} neighborIntelligence={neighborIntelligence} filter={neighborFilter} setFilter={setNeighborFilter} focusId={neighborFocusId} onFocus={setNeighborFocusId} onOpen={id=>{setSelectedId(id);setNeighborFocusId(null);}} onCompare={setCompareId}/>} 
            {tab==='Activity'&&<TimelineView property={property}/>} 
          </div>

          <footer>
            <button type="button"><FileText size={14}/>Property Package</button>
            <button type="button" className="primary">{assignment?'Open Assignment':'Create Assignment'}<ArrowRight size={14}/></button>
          </footer>
        </aside>

        {compareId&&<CompareTray subject={property} comparison={PROPERTIES.find(item=>item.id===compareId)} onClose={()=>setCompareId(null)}/>} 

        {whyOpen&&
          <section className="explorer-v5__why-modal">
            <header>
              <strong>Why SCIIP reached this view</strong>
              <button type="button" onClick={()=>setWhyOpen(false)}>
                <X size={15}/>
              </button>
            </header>
            <p>{briefing.headline}</p>
            {[...opportunities.slice(0,3),...risks.slice(0,2)].map(item=>
              <span key={`${item.type}-${item.title}`}>
                <CheckCircle2 size={13}/>
                {item.title}: {item.detail}
              </span>
            )}
            <footer>{briefing.confidencePct}% confidence</footer>
          </section>
        }
      </main>
    </section>
  );
}


function OverviewView({briefing,property,opportunities,risks,neighborIntelligence}){
  return <section className="explorer-v5__overview">
    <BriefingView briefing={briefing} property={property}/>
    <section className="explorer-v5__section-block"><header><strong>AI Intelligence</strong><span>Progressive detail</span></header>
      <div className="explorer-v5__signal-summary">
        <article><Lightbulb size={15}/><div><strong>{opportunities.length} Opportunities</strong><p>{opportunities[0]?.title||'No material opportunity signal'}</p></div></article>
        <article><AlertTriangle size={15}/><div><strong>{risks.length} Risks</strong><p>{risks[0]?.title||'No material risk signal'}</p></div></article>
        <article><Users size={15}/><div><strong>Neighbor context</strong><p>{neighborIntelligence.summary}</p></div></article>
      </div>
    </section>
  </section>;
}

function PropertyView({property,owner}){
  const facts=[['Building SF',formatNumber(property.buildingSf)],['Clear Height',property.clearHeightFt?`${property.clearHeightFt}'`:'—'],['Power',property.powerAmps?`${Number(property.powerAmps).toLocaleString()} A`:'—'],['Year',property.yearBuilt||'—'],['Status',property.status||'—'],['Owner',property.owner||'—']];
  return <section className="explorer-v5__progressive">
    <section className="explorer-v5__section-block"><header><strong>Property</strong><span>Core specifications</span></header><div className="explorer-v5__fact-grid">{facts.map(([k,v])=><article key={k}><span>{k}</span><strong>{v}</strong></article>)}</div></section>
    <section className="explorer-v5__section-block"><OwnerView owner={owner}/></section>
    <section className="explorer-v5__section-block"><header><strong>Leasing & Capital Markets</strong><span>Governed record</span></header><p className="explorer-v5__muted">Lease history, sale history, debt, documents, and assignment evidence remain attached to the canonical property record.</p></section>
  </section>;
}

function MarketView({property,competitors,comparables,market}){
  return <section className="explorer-v5__progressive">
    <section className="explorer-v5__section-block"><header><strong>Market Spotlight</strong><span>5-mile context</span></header><div className="explorer-v5__metrics"><article><span>Vacancy</span><strong>{market.vacancyRate}%</strong></article><article><span>Asking Rate</span><strong>${market.askingRate} NNN</strong></article><article><span>Demand Score</span><strong>{market.demandScore}</strong></article><article><span>Submarket</span><strong>{property.submarket}</strong></article></div></section>
    <section className="explorer-v5__section-block"><header><strong>Competition</strong><span>{competitors.length} active</span></header>{competitors.map(item=><article className="explorer-v5__compact-row" key={item.id}><div><strong>{item.address}</strong><span>{item.status}</span></div><b>{formatNumber(item.buildingSf)} SF</b></article>)}</section>
    <section className="explorer-v5__section-block"><header><strong>Comparable Activity</strong><span>{comparables.length} governed</span></header>{comparables.map(item=><article className="explorer-v5__compact-row" key={item.id}><div><strong>{item.type==='LEASE_COMPARABLE'?'Lease Comparable':'Sale Comparable'}</strong><span>{item.submarket}</span></div><b>{formatNumber(item.buildingSf)} SF</b></article>)}</section>
  </section>;
}

function NeighborsView({subject,neighbors,neighborIntelligence,filter,setFilter,focusId,onFocus,onOpen,onCompare}){
  const rows=Object.values(neighbors.directions).flat();
  const filtered=rows.filter(row=>{
    if(filter==='Adjacent')return row.relationshipType==='ADJOINING';
    if(filter==='Across Street')return row.relationshipType==='ACROSS_STREET';
    if(filter==="500'")return row.distanceFeet<=500;
    if(filter==='1 Mile')return row.distanceFeet<=5280;
    return true;
  });
  return <section className="explorer-v5__neighbors">
    <header className="explorer-v5__neighbors-head"><div><strong>Neighbor Intelligence</strong><span>{rows.length} identified around {subject.address}</span></div><MapPin size={18}/></header>
    <div className="explorer-v5__neighbor-filters">{NEIGHBOR_FILTERS.map(item=><button type="button" key={item} className={filter===item?'active':''} onClick={()=>setFilter(item)}>{item}</button>)}</div>
    <p className="explorer-v5__neighbor-summary">{neighborIntelligence.summary}</p>
    <div className="explorer-v5__neighbor-list">{filtered.length?filtered.map(row=>{
      const p=row.property; const selected=focusId===p.id; const strategic=row.relationshipType==='ADJOINING'||p.owner===subject.owner;
      return <article key={`${row.direction}-${p.id}`} className={`explorer-v5__neighbor-card ${selected?'is-focused':''}`}>
        <button type="button" className="explorer-v5__neighbor-main" onClick={()=>onFocus(selected?null:p.id)}>
          <span className="explorer-v5__neighbor-kicker">{row.relationshipType==='ADJOINING'?'ADJACENT':row.relationshipType.replaceAll('_',' ')} · {row.direction} · {formatDistance(row.distanceFeet)}</span>
          <strong>{p.address}</strong>
          <span>{formatNumber(p.buildingSf)} SF · {p.status||'PROPERTY'}</span>
          <span>{p.owner||'Owner unavailable'}</span>
          <div><b>Similarity {similarity(subject,p)}%</b>{strategic&&<em>Strategic</em>}</div>
        </button>
        <footer><button type="button" onClick={()=>onCompare(p.id)}>Compare</button><button type="button" onClick={()=>onOpen(p.id)}>Open Property <ArrowRight size={12}/></button></footer>
      </article>;
    }):<p className="explorer-v5__empty">No neighbors match this filter.</p>}</div>
  </section>;
}

function CompareTray({subject,comparison,onClose}){
  if(!comparison)return null;
  return <section className="explorer-v5__compare-tray"><header><strong>Quick Compare</strong><button type="button" onClick={onClose}><X size={14}/></button></header><div><article><span>Subject</span><strong>{subject.address}</strong><p>{formatNumber(subject.buildingSf)} SF · {subject.clearHeightFt||'—'}' clear · {formatNumber(subject.powerAmps)} A</p></article><ArrowRight size={18}/><article><span>Neighbor</span><strong>{comparison.address}</strong><p>{formatNumber(comparison.buildingSf)} SF · {comparison.clearHeightFt||'—'}' clear · {formatNumber(comparison.powerAmps)} A</p></article></div></section>;
}

function formatNumber(value){return Number(value||0).toLocaleString();}
function formatDistance(feet){const n=Number(feet||0);return n<1000?`${Math.round(n)}'`:`${(n/5280).toFixed(2)} mi`;}
function similarity(a,b){
  const sfA=Number(a.buildingSf||0),sfB=Number(b.buildingSf||0); const sfScore=sfA&&sfB?Math.max(0,100-Math.abs(sfA-sfB)/Math.max(sfA,sfB)*100):60;
  const clearScore=a.clearHeightFt&&b.clearHeightFt?Math.max(0,100-Math.abs(a.clearHeightFt-b.clearHeightFt)*5):70;
  const powerScore=a.powerAmps&&b.powerAmps?Math.max(0,100-Math.abs(a.powerAmps-b.powerAmps)/Math.max(a.powerAmps,b.powerAmps)*100):65;
  return Math.round(sfScore*.5+clearScore*.25+powerScore*.25);
}

function BriefingView({briefing,property}){
  return (
    <section className="explorer-v5__briefing">
      <span className={`outlook outlook--${briefing.outlook.toLowerCase()}`}>
        {briefing.outlook} OUTLOOK
      </span>
      <h3>{briefing.headline}</h3>
      <div>
        {briefing.bullets.map(item=>
          <span key={item}><CheckCircle2 size={13}/>{item}</span>
        )}
      </div>
      <section className="explorer-v5__metrics">
        <article><span>Vacancy</span><strong>{briefing.marketVacancy}%</strong></article>
        <article><span>Asking Rate</span><strong>${briefing.askingRate} NNN</strong></article>
        <article><span>Confidence</span><strong>{briefing.confidencePct}%</strong></article>
        <article><span>Power</span><strong>{Number(property.powerAmps||0).toLocaleString()} A</strong></article>
      </section>
    </section>
  );
}

function SignalList({title,icon:Icon,rows,tone}){
  return (
    <section className={`explorer-v5__signals explorer-v5__signals--${tone}`}>
      <header><Icon size={17}/><strong>{title}</strong></header>
      {rows.length?rows.map(row=>
        <article key={`${row.type}-${row.title}`}>
          <div>
            <strong>{row.title}</strong>
            <p>{row.detail}</p>
          </div>
          <b>{row.score}</b>
        </article>
      ):<p>No material signals identified.</p>}
    </section>
  );
}

function OwnerView({owner}){
  return (
    <section className="explorer-v5__owner">
      <header><Building2 size={17}/><strong>Owner Intelligence</strong></header>
      <h3>{owner.owner}</h3>
      <p>{owner.summary}</p>
      <section className="explorer-v5__metrics">
        <article><span>Assets</span><strong>{owner.assetCount}</strong></article>
        <article><span>Total SF</span><strong>{owner.totalSf.toLocaleString()}</strong></article>
        <article><span>Available SF</span><strong>{owner.availableSf.toLocaleString()}</strong></article>
        <article><span>Assignments</span><strong>{owner.activeAssignments}</strong></article>
      </section>
      {owner.nearbyAssets.map(item=>
        <article className="owner-asset" key={item.id}>
          <strong>{item.address}</strong>
          <span>{Number(item.buildingSf||0).toLocaleString()} SF · {item.status}</span>
        </article>
      )}
    </section>
  );
}

function TimelineView({property}){
  const rows=[
    ['Aug 6, 2026','Property intelligence refreshed','Latest governed market and assignment evidence applied.'],
    ['Aug 5, 2026',property.recentChange||'Property record updated','Change preserved in permanent history.'],
    ['Jul 22, 2026','Client report published','Assignment snapshot and report version retained.'],
    ['Jun 18, 2026','Promoted from SuperSheet','Canonical property identity and evidence created.']
  ];
  return (
    <section className="explorer-v5__timeline">
      <header><Sparkles size={17}/><strong>Dynamic Property Timeline</strong></header>
      {rows.map(([date,title,detail])=>
        <article key={`${date}-${title}`}>
          <span>{date}</span>
          <strong>{title}</strong>
          <p>{detail}</p>
        </article>
      )}
    </section>
  );
}

function ActionsView({rows}){
  return (
    <section className="explorer-v5__actions">
      <header><Target size={17}/><strong>Recommended Actions</strong></header>
      {rows.map(row=>
        <article key={row.type}>
          <span>{row.timing}</span>
          <strong>{row.title}</strong>
          <p>{row.detail}</p>
          <button type="button">Start <ArrowRight size={13}/></button>
        </article>
      )}
    </section>
  );
}

function WhyView({briefing,opportunities,risks,neighborIntelligence}){
  return (
    <section className="explorer-v5__why">
      <header><CircleHelp size={17}/><strong>Explainable Intelligence</strong></header>
      <h3>{briefing.headline}</h3>
      <p>{neighborIntelligence.summary}</p>
      {[...opportunities,...risks].slice(0,7).map(row=>
        <span key={`${row.type}-${row.title}`}>
          <CheckCircle2 size={13}/>
          {row.title}
        </span>
      )}
      <footer>{briefing.confidencePct}% governed confidence</footer>
    </section>
  );
}

function DIRECTIONS_FLAT(neighbors){
  return Object.values(neighbors.directions).flat();
}
