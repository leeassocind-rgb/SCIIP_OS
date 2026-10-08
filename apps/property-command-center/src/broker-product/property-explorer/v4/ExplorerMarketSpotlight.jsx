import React,{useMemo,useState}from'react';
import{
  ArrowRight,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  FileText,
  Layers3,
  MapPin,
  Search,
  Sparkles,
  Target,
  Clock3,
  Users,
  X
}from'lucide-react';
import{
  buildMarketSpotlight,
  buildPropertyHealthScore,
  buildPropertyTimeline,
  buildWhyExplanation,
  createBasemapProviderConfig,
  parseExplorerCommand
}from'./explorerSpotlightEngine.js';
import ImmediateNeighborsPanel,{
  ImmediateNeighborOverlay
}from'../v4_3/ImmediateNeighborsPanel.jsx';
import'./explorer-market-spotlight.css';

const PROPERTY={
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
  lat:34.1069,
  lng:-117.4112,
  recentChange:'Power confirmed at up to 8,000 amps'
};

const PROPERTIES=[
  PROPERTY,
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
  }
];

const COMPARABLES=[
  {
    id:'C-LEASE-01',
    type:'LEASE_COMPARABLE',
    address:'712K SF Lease Comparable',
    buildingSf:712000,
    submarket:'Inland Empire West',
    lat:34.0880,
    lng:-117.4470
  },
  {
    id:'C-SALE-01',
    type:'SALE_COMPARABLE',
    address:'Large Format Sale Comparable',
    buildingSf:680000,
    submarket:'Inland Empire West',
    lat:34.1350,
    lng:-117.4550
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
  }
];

const ASSIGNMENTS=[
  {
    id:'A-BROOKFIELD',
    propertyId:'P-IEW-201',
    client:'Brookfield Properties',
    type:'Active Listing',
    status:'ACTIVE'
  }
];

const TABS=[
  'Overview',
  'Neighbors',
  'Intelligence',
  'Competition',
  'Transactions',
  'Requirements',
  'Assignment',
  'Documents',
  'Activity'
];

const MARKER_LEGEND=[
  ['Available','available'],
  ['Assignment','assignment'],
  ['Lease Comp','lease'],
  ['Sale Comp','sale'],
  ['Requirement','requirement']
];

export default function ExplorerMarketSpotlight(){
  const[tab,setTab]=useState('Overview');
  const[spotlightOn,setSpotlightOn]=useState(true);
  const[command,setCommand]=useState('');
  const[drawerOpen,setDrawerOpen]=useState(true);
  const[layersOpen,setLayersOpen]=useState(false);
  const[whyOpen,setWhyOpen]=useState(false);

  const spotlight=useMemo(
    ()=>buildMarketSpotlight({
      selectedProperty:PROPERTY,
      properties:PROPERTIES,
      comparables:COMPARABLES,
      requirements:REQUIREMENTS,
      assignments:ASSIGNMENTS,
      radiusMiles:5
    }),
    []
  );

  const health=useMemo(
    ()=>buildPropertyHealthScore({
      property:PROPERTY,
      market:{
        demandScore:88,
        competitorCount:spotlight.competitiveProperties.length
      }
    }),
    [spotlight]
  );

  const why=useMemo(
    ()=>buildWhyExplanation({
      property:PROPERTY,
      spotlight,
      health
    }),
    [spotlight,health]
  );

  const timeline=useMemo(()=>buildPropertyTimeline(PROPERTY),[]);
  const basemap=useMemo(
    ()=>createBasemapProviderConfig({provider:'PLACEHOLDER'}),
    []
  );

  function executeCommand(event){
    event.preventDefault();
    const parsed=parseExplorerCommand(command);
    if(parsed.actions.includes('OPEN_SPOTLIGHT'))setSpotlightOn(true);
    if(parsed.actions.includes('OPEN_WHY'))setWhyOpen(true);
    if(parsed.actions.includes('OPEN_TIMELINE'))setTab('Activity');
    if(parsed.actions.includes('SHOW_COMPETITION'))setTab('Competition');
    if(parsed.actions.includes('SHOW_REQUIREMENTS'))setTab('Requirements');
    if(parsed.actions.includes('OPEN_ASSIGNMENT'))setTab('Assignment');
  }

  return (
    <section className="explorer-v4">
      <header className="explorer-v4__command">
        <form onSubmit={executeCommand}>
          <BrainCircuit size={17}/>
          <input
            value={command}
            onChange={event=>setCommand(event.target.value)}
            placeholder="Ask Explorer: spotlight Lowell, show competition, explain why, open timeline..."
          />
          <button type="submit">Run</button>
        </form>

        <div>
          <button
            type="button"
            className={spotlightOn?'active':''}
            onClick={()=>setSpotlightOn(!spotlightOn)}
          >
            <Target size={15}/> Market Spotlight
          </button>
          <button type="button" onClick={()=>setLayersOpen(!layersOpen)}>
            <Layers3 size={15}/> Layers
          </button>
        </div>
      </header>

      <main className="explorer-v4__canvas">
        <section className="explorer-v4__map">
          <div className="explorer-v4__grid"/>
          <div className="explorer-v4__road road-a"/>
          <div className="explorer-v4__road road-b"/>
          <div className="explorer-v4__road road-c"/>

          {spotlightOn&&
            <div className="explorer-v4__halo">
              <span>5-mile Market Spotlight</span>
            </div>
          }

          <ImmediateNeighborOverlay
            subject={PROPERTY}
            properties={PROPERTIES}
            parcelRelationships={[]}
          />

          <Marker
            type="assignment"
            left="52%"
            top="46%"
            label={PROPERTY.address}
          />
          <Marker
            type="available"
            left="39%"
            top="52%"
            label="10800 Slover Ave"
            faded={spotlightOn}
          />
          <Marker
            type="available"
            left="60%"
            top="34%"
            label="North Rialto Distribution Center"
            faded={spotlightOn}
          />
          <Marker
            type="lease"
            left="46%"
            top="38%"
            label="Lease Comparable"
            faded={spotlightOn}
          />
          <Marker
            type="sale"
            left="58%"
            top="57%"
            label="Sale Comparable"
            faded={spotlightOn}
          />
          <Marker
            type="requirement"
            left="50%"
            top="30%"
            label="Aerospace Requirement"
            faded={spotlightOn}
          />

          <section className="explorer-v4__legend">
            {MARKER_LEGEND.map(([label,type])=>
              <span key={type}>
                <i className={type}/>
                {label}
              </span>
            )}
          </section>

          <section className="explorer-v4__provider">
            <span>Basemap</span>
            <strong>{basemap.provider}</strong>
            <small>Ready for Mapbox, Google Maps, or ArcGIS credentials</small>
          </section>

          {layersOpen&&
            <section className="explorer-v4__layers">
              <header>
                <strong>GIS Layers</strong>
                <button type="button" onClick={()=>setLayersOpen(false)}>
                  <X size={14}/>
                </button>
              </header>
              {[
                'Available Properties',
                'Assignment Properties',
                'Lease Comparables',
                'Sale Comparables',
                'Tenant Requirements',
                'Power Infrastructure',
                'Rail',
                'Ports & Airports'
              ].map((layer,index)=>
                <label key={layer}>
                  <input type="checkbox" defaultChecked={index<5}/>
                  <span>{layer}</span>
                </label>
              )}
            </section>
          }
        </section>

        {drawerOpen&&
          <aside className="explorer-v4__drawer">
            <header className="explorer-v4__drawer-header">
              <button type="button" onClick={()=>setDrawerOpen(false)}>
                <ChevronRight size={18}/>
              </button>
              <div>
                <span>Property</span>
                <h2>{PROPERTY.address}</h2>
                <p>{PROPERTY.city} · {PROPERTY.submarket}</p>
              </div>
              <div className="explorer-v4__health">
                <strong>{health.score}</strong>
                <span>{health.label}</span>
              </div>
            </header>

            <nav className="explorer-v4__tabs">
              {TABS.map(item=>
                <button
                  type="button"
                  key={item}
                  className={tab===item?'active':''}
                  onClick={()=>setTab(item)}
                >
                  {item}
                </button>
              )}
            </nav>

            <div className="explorer-v4__drawer-scroll">
              {tab==='Overview'&&
                <Overview
                  property={PROPERTY}
                  health={health}
                  spotlight={spotlight}
                  onWhy={()=>setWhyOpen(true)}
                />
              }

              {tab==='Neighbors'&&
                <ImmediateNeighborsPanel
                  subject={PROPERTY}
                  properties={PROPERTIES}
                  parcelRelationships={[]}
                />
              }

              {tab==='Intelligence'&&
                <Intelligence why={why} health={health}/>
              }

              {tab==='Competition'&&
                <Competition rows={spotlight.competitiveProperties}/>
              }

              {tab==='Transactions'&&
                <Transactions rows={spotlight.comparables}/>
              }

              {tab==='Requirements'&&
                <Requirements rows={spotlight.requirements}/>
              }

              {tab==='Assignment'&&
                <Assignment rows={spotlight.assignments}/>
              }

              {tab==='Documents'&&
                <Documents/>
              }

              {tab==='Activity'&&
                <Activity rows={timeline}/>
              }
            </div>

            <footer className="explorer-v4__drawer-footer">
              <button type="button">
                <Users size={14}/> Save Property
              </button>
              <button type="button">
                <FileText size={14}/> Property Package
              </button>
              <button type="button" className="primary">
                Open Assignment <ArrowRight size={14}/>
              </button>
            </footer>
          </aside>
        }

        {!drawerOpen&&
          <button
            type="button"
            className="explorer-v4__drawer-launcher"
            onClick={()=>setDrawerOpen(true)}
          >
            <Building2 size={16}/>
            {PROPERTY.address}
          </button>
        }

        {whyOpen&&
          <section className="explorer-v4__why-modal">
            <header>
              <div>
                <CircleHelp size={18}/>
                <strong>{why.headline}</strong>
              </div>
              <button type="button" onClick={()=>setWhyOpen(false)}>
                <X size={15}/>
              </button>
            </header>
            <p>{why.conclusion}</p>
            <div>
              {why.evidence.map(item=>
                <span key={item}>
                  <CheckCircle2 size={13}/>{item}
                </span>
              )}
            </div>
            <footer>{why.confidencePct}% confidence</footer>
          </section>
        }
      </main>
    </section>
  );
}

function Marker({type,left,top,label,faded=false}){
  return (
    <button
      type="button"
      className={`explorer-v4__marker ${type} ${faded?'faded':''}`}
      style={{left,top}}
      title={label}
    >
      <MapPin size={type==='assignment'?27:21}/>
      {type==='assignment'&&<b>★</b>}
      <span>{label}</span>
    </button>
  );
}

function Overview({property,health,spotlight,onWhy}){
  return (
    <>
      <section className="explorer-v4__hero">
        <div>
          <strong>{property.buildingSf.toLocaleString()} SF</strong>
          <span>{property.status}</span>
        </div>
        <small>{property.owner}</small>
      </section>

      <section className="explorer-v4__specs">
        <div><span>Clear Height</span><strong>{property.clearHeightFt}′</strong></div>
        <div><span>Power</span><strong>{property.powerAmps.toLocaleString()} amps</strong></div>
        <div><span>Year Built</span><strong>{property.yearBuilt}</strong></div>
        <div><span>Recent Change</span><strong>{property.recentChange}</strong></div>
      </section>

      <section className="explorer-v4__spotlight-summary">
        <header>
          <Target size={16}/>
          <strong>Market Spotlight</strong>
        </header>
        <p>{spotlight.summary}</p>
        <div>
          <article><span>Competitors</span><strong>{spotlight.competitiveProperties.length}</strong></article>
          <article><span>Comparables</span><strong>{spotlight.comparables.length}</strong></article>
          <article><span>Requirements</span><strong>{spotlight.requirements.length}</strong></article>
          <article><span>Assignments</span><strong>{spotlight.assignments.length}</strong></article>
        </div>
      </section>

      <section className="explorer-v4__health-factors">
        <header>
          <Sparkles size={16}/>
          <strong>Property Health</strong>
          <button type="button" onClick={onWhy}>Why?</button>
        </header>
        {health.factors.map(item=>
          <div key={item.label}>
            <span>{item.label}</span>
            <i><b style={{width:`${item.score}%`}}/></i>
            <strong>{item.score}</strong>
          </div>
        )}
      </section>
    </>
  );
}

function Intelligence({why,health}){
  return (
    <section className="explorer-v4__panel">
      <header><BrainCircuit size={17}/><strong>Explainable Intelligence</strong></header>
      <h3>{why.headline}</h3>
      <p>{why.conclusion}</p>
      {why.evidence.map(item=>
        <span key={item}><CheckCircle2 size={13}/>{item}</span>
      )}
      <footer>{health.score} health score · {why.confidencePct}% confidence</footer>
    </section>
  );
}

function Competition({rows}){
  return (
    <section className="explorer-v4__panel">
      <header><Building2 size={17}/><strong>Competitive Properties</strong></header>
      {rows.map(row=>
        <article key={row.item.id}>
          <strong>{row.item.address}</strong>
          <span>{row.item.buildingSf.toLocaleString()} SF · {row.distanceMiles.toFixed(1)} miles</span>
        </article>
      )}
    </section>
  );
}

function Transactions({rows}){
  return (
    <section className="explorer-v4__panel">
      <header><FileText size={17}/><strong>Comparable Transactions</strong></header>
      {rows.map(row=>
        <article key={row.item.id}>
          <strong>{row.item.address}</strong>
          <span>{row.item.type.replaceAll('_',' ')} · {row.distanceMiles.toFixed(1)} miles</span>
        </article>
      )}
    </section>
  );
}

function Requirements({rows}){
  return (
    <section className="explorer-v4__panel">
      <header><Target size={17}/><strong>Matching Requirements</strong></header>
      {rows.map(row=>
        <article key={row.id}>
          <strong>{row.company}</strong>
          <span>{row.minSf.toLocaleString()}–{row.maxSf.toLocaleString()} SF · {row.fitScore}% fit</span>
        </article>
      )}
    </section>
  );
}

function Assignment({rows}){
  return (
    <section className="explorer-v4__panel">
      <header><Users size={17}/><strong>Assignment Awareness</strong></header>
      {rows.map(row=>
        <article key={row.id}>
          <strong>{row.client}</strong>
          <span>{row.type} · {row.status}</span>
          <button type="button">Open Assignment <ArrowRight size={13}/></button>
        </article>
      )}
    </section>
  );
}

function Documents(){
  return (
    <section className="explorer-v4__panel">
      <header><FileText size={17}/><strong>Documents</strong></header>
      <article><strong>Property Brochure</strong><span>Current governed version</span></article>
      <article><strong>Client Listing Report</strong><span>Latest published report</span></article>
      <article><strong>Property Package</strong><span>Generate from current evidence</span></article>
    </section>
  );
}

function Activity({rows}){
  return (
    <section className="explorer-v4__panel">
      <header><Clock3 size={17}/><strong>Property Timeline</strong></header>
      {rows.map(row=>
        <article key={`${row.date}-${row.title}`}>
          <small>{row.date}</small>
          <strong>{row.title}</strong>
          <span>{row.detail}</span>
        </article>
      )}
    </section>
  );
}
