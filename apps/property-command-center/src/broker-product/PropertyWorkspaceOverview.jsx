import React,{useMemo,useState}from'react';
import{ArrowRight,Building2,CheckCircle2,Clock3,FileText,Gauge,History,Map,Search,Sparkles,Target,TrendingUp,Users}from'lucide-react';
import'./property-workspace-overview.css';

const PROPERTY=Object.freeze({id:'P-IEW-201',name:'Locust Gateway Logistics Center',address:'2125 W Lowell St',city:'Rialto',state:'CA',owner:'Brookfield Properties',submarket:'Inland Empire West',buildingSf:664859,clearHeightFt:42,powerAmps:8000,dockHighDoors:82,trailerParking:398,truckCourtFt:185,status:'UNDER CONSTRUCTION',delivery:'2027',propertyScore:92,marketPosition:'Top 10%',demandScore:'High',competitivePressure:'Medium',leasingProbability:'High'});
const SECTIONS=Object.freeze([['OVERVIEW','Overview'],['MARKET','Market'],['COMPETITION','Competition'],['COMPARABLES','Comparables'],['REQUIREMENTS','Requirements'],['MARKETING','Marketing'],['HISTORY','History']]);

export default function PropertyWorkspaceOverview(){
 const[section,setSection]=useState('OVERVIEW');
 const[query,setQuery]=useState('');
 const property=PROPERTY;
 const summary=useMemo(()=>`${property.name} remains one of the strongest modern large-format opportunities in ${property.submarket}. The property continues to differentiate through ${property.clearHeightFt}-foot clear height, ${property.powerAmps.toLocaleString()} amps of power, and ${property.trailerParking} trailer spaces. Recent competitive and demand signals support continued proactive leasing and prospecting activity.`,[property]);
 return <section className="property-workspace broker-page">
  <header className="property-intelligence-header">
   <div className="property-intelligence-header__main"><p className="broker-kicker">Property intelligence profile</p><h1>{property.name}</h1><p>{property.address}, {property.city}, {property.state} · {property.owner}</p><div className="property-header-facts"><span>{property.buildingSf.toLocaleString()} SF</span><span>{property.status.replaceAll('_',' ')}</span><span>Delivery {property.delivery}</span></div></div>
   <div className="property-header-actions"><label className="property-search"><Search size={15}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search properties…"/></label><button type="button"><Target size={15}/> Create Assignment</button><button type="button" className="primary"><FileText size={15}/> Generate Property Package</button></div>
  </header>
  <nav className="property-section-nav" aria-label="Property workspace sections">{SECTIONS.map(([id,label])=><button type="button" key={id} className={section===id?'active':''} onClick={()=>setSection(id)}>{label}</button>)}</nav>
  {section==='OVERVIEW'?<Overview property={property} summary={summary}/>:<Placeholder section={section} property={property}/>} 
 </section>;
}

function Overview({property,summary}){
 const highlights=[['Building size',`${property.buildingSf.toLocaleString()} SF`],['Clear height',`${property.clearHeightFt}′`],['Power',`Up to ${property.powerAmps.toLocaleString()} amps`],['Dock-high doors',property.dockHighDoors],['Trailer parking',property.trailerParking],['Truck court',`${property.truckCourtFt}′`],['Ownership',property.owner],['Delivery',property.delivery]];
 const changes=[['2','New comparables','Lease and sale evidence added'],['1','Competitive rate change','Pricing review required'],['3','Tenant requirements','New matching demand'],['1','Inquiry added','New prospect activity'],['0','Marketing changes','No material change']];
 const health=[['Overall property score',property.propertyScore,'High-quality physical and market profile'],['Market position',property.marketPosition,'Among the strongest large-format options'],['Demand score',property.demandScore,'Current requirements support prospecting'],['Competitive pressure',property.competitivePressure,'Active but manageable competitive set'],['Leasing probability',property.leasingProbability,'Strong fit for target occupiers']];
 return <>
  <section className="property-score-strip">{health.map(([label,value,detail])=><article key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>)}</section>
  <div className="property-overview-grid"><main>
   <section className="broker-panel property-ai-summary"><header><div><p className="broker-kicker">AI property summary</p><h2>Why this property matters</h2></div><Sparkles size={19}/></header><div><p>{summary}</p><button type="button">View supporting evidence <ArrowRight size={15}/></button></div></section>
   <section className="broker-panel"><header><div><p className="broker-kicker">What changed</p><h2>Recent property intelligence</h2></div></header><div className="property-change-grid">{changes.map(([value,title,detail])=><button type="button" key={title}><strong>{value}</strong><span>{title}</span><small>{detail}</small></button>)}</div></section>
  </main><aside>
   <section className="broker-panel"><header><div><p className="broker-kicker">Building highlights</p><h2>Subject property</h2></div><Building2 size={18}/></header><div className="property-highlight-grid">{highlights.map(([label,value])=><article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div></section>
   <section className="broker-panel property-next-actions"><header><div><p className="broker-kicker">Recommended next actions</p><h2>Broker workflow</h2></div></header><div className="broker-list"><Action icon={<Users size={15}/>} title="Review matching requirements" detail="Three active tenant requirements warrant review"/><Action icon={<TrendingUp size={15}/>} title="Review competitive pricing" detail="One competitor changed its asking rate"/><Action icon={<Clock3 size={15}/>} title="Update outreach plan" detail="Refresh prospecting before the next reporting period"/></div></section>
  </aside></div>
 </>;
}
function Placeholder({section,property}){const icon={MARKET:<Gauge size={22}/>,COMPETITION:<Building2 size={22}/>,COMPARABLES:<FileText size={22}/>,REQUIREMENTS:<Users size={22}/>,MARKETING:<Target size={22}/>,HISTORY:<History size={22}/>}[section]||<Map size={22}/>;return <section className="property-placeholder broker-panel"><div>{icon}<p className="broker-kicker">{section.toLowerCase()}</p><h2>{property.name}</h2><p>This workspace is reserved for the next Properties intelligence phase.</p><span><CheckCircle2 size={15}/> Property context preserved</span></div></section>}
function Action({icon,title,detail}){return <article><span className="broker-icon">{icon}</span><div><strong>{title}</strong><small>{detail}</small></div><ArrowRight size={15}/></article>}
