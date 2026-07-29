import LifecycleMarketOutcomeClassificationCenter from "./components/LifecycleMarketOutcomeClassificationCenter.jsx";
import PropertyLifecycleIntelligenceCenter from "./components/PropertyLifecycleIntelligenceCenter.jsx";
import GovernedIdentityDecisionExecutionCenter from "./components/GovernedIdentityDecisionExecutionCenter.jsx";
import IdentityReviewGovernanceCenter from "./components/IdentityReviewGovernanceCenter.jsx";
import CanonicalPropertyIdentityCenter from "./components/CanonicalPropertyIdentityCenter.jsx";
import React,{useEffect,useMemo,useRef,useState}from'react';
import{createRoot}from'react-dom/client';
import{Activity,ArrowUpRight,BookOpen,BriefcaseBusiness,Building2,Check,ChevronDown,ChevronRight,Clock3,FileText,HeartHandshake,LayoutDashboard,Map,MapPin,Menu,MessageSquareText,PanelLeftClose,PanelLeftOpen,Search,Settings,Sparkles,TriangleAlert,Users,Plus,SlidersHorizontal}from'lucide-react';
import'./styles.css';
import'./opportunity.css';
import'./workflow.css';
import'./executive.css';
import'./foundation.css';
import'./collaboration.css';
import'./integrations.css';
import'./intelligence.css';
import'./market-intelligence.css';
import'./platform-runtime.css';
import'./autonomous-intelligence.css';
import'./property-digital-twin.css';
import'./decision-intelligence.css';
import'./executive-ai.css';
import'./enterprise-operations.css';
import'./enterprise-knowledge-graph.css';
import'./real-time-intelligence.css';
import'./production-enterprise.css';
import'./production-validation.css';
import'./evidence-certification.css';
import'./temporal-intelligence.css';
import{assignments}from'./product/assignmentData.js';
import{getWorkspaceDefinition}from'./product/workspaceRegistry.js';
import{createWorkspaceMemory}from'./product/workspaceMemory.js';
import SuperSheetIngestion from'./components/SuperSheetIngestion.jsx';
import KnowledgeGraphWorkspace from'./components/KnowledgeGraphWorkspace.jsx';
import AIPropertyCopilot from'./components/AIPropertyCopilot.jsx';
import GISIntelligenceWorkspace from'./components/GISIntelligenceWorkspace.jsx';
import OpportunityIntelligenceWorkspace from'./components/OpportunityIntelligenceWorkspace.jsx';
import BrokerActionCenter from'./components/BrokerActionCenter.jsx';
import ExecutiveCommandCenter from'./components/ExecutiveCommandCenter.jsx';
import EnterpriseFoundationCenter from'./components/EnterpriseFoundationCenter.jsx';
import EnterpriseCollaborationCenter from'./components/EnterpriseCollaborationCenter.jsx';
import IntegrationPlatformCenter from'./components/IntegrationPlatformCenter.jsx';
import IntelligencePlatformCenter from'./components/IntelligencePlatformCenter.jsx';
import MarketIntelligenceCenter from'./components/MarketIntelligenceCenter.jsx';
import PlatformRuntimeCenter from'./components/PlatformRuntimeCenter.jsx';
import ExecutiveMorningBriefCenter from'./components/ExecutiveMorningBriefCenter.jsx';
import PropertyDigitalTwinCenter from'./components/PropertyDigitalTwinCenter.jsx';
import DecisionIntelligenceCenter from'./components/DecisionIntelligenceCenter.jsx';
import ExecutiveAICommandCenter from'./components/ExecutiveAICommandCenter.jsx';
import EnterpriseOperationsCenter from'./components/EnterpriseOperationsCenter.jsx';
import EnterpriseKnowledgeGraphCenter from'./components/EnterpriseKnowledgeGraphCenter.jsx';
import RealTimeIntelligenceCenter from'./components/RealTimeIntelligenceCenter.jsx';
import ProductionEnterpriseCenter from'./components/ProductionEnterpriseCenter.jsx';
import ProductionDataCertificationCenter from'./components/ProductionDataCertificationCenter.jsx';
import EvidenceCertificationCenter from'./components/EvidenceCertificationCenter.jsx';
import TemporalPropertyIntelligenceCenter from'./components/TemporalPropertyIntelligenceCenter.jsx';
import{parseWorkspaceRoute,replaceWorkspaceRoute}from'./platform/workspaceRouter.js';
import{createPlatformBridge,PLATFORM_EVENTS}from'./platform/platformBridge.js';
import{PROPERTY_COMMAND_CENTER_APP}from'./platform/appManifest.js';

const memory=createWorkspaceMemory();
const bridge=createPlatformBridge();
const initialRoute=parseWorkspaceRoute(typeof window!=='undefined'?window.location:null);
const primaryNav=[['Today',LayoutDashboard],['Assignments',BriefcaseBusiness],['Relationships',HeartHandshake],['Properties',Building2],['Markets',Activity],['GIS',Map],['Reports',FileText],['Administration',Settings]];

function Badge({children,tone='neutral'}){return <span className={`badge ${tone}`}>{children}</span>}
function Panel({title,meta,children,action}){return <section className="panel"><header><div><h3>{title}</h3>{meta&&<p>{meta}</p>}</div>{action}</header>{children}</section>}
function HealthIcon({status}){return status==='complete'?<span className="health-icon complete"><Check size={14}/></span>:<span className="health-icon attention"><TriangleAlert size={14}/></span>}

function AssignmentPicker({selected,onSelect}){
 const [open,setOpen]=useState(false);
 return <div className="assignment-picker"><button onClick={()=>setOpen(!open)}><div className="assignment-monogram">{selected.type.charAt(0)}</div><div><small>{selected.type}</small><strong>{selected.name}</strong><span>{selected.client}</span></div><ChevronDown size={18}/></button>{open&&<div className="assignment-menu"><div className="menu-search"><Search size={15}/><input placeholder="Search assignments"/></div>{assignments.map(a=><button key={a.id} className={a.id===selected.id?'active':''} onClick={()=>{onSelect(a);setOpen(false)}}><div><small>{a.type}</small><strong>{a.name}</strong><span>{a.client} · {a.updated}</span></div>{a.id===selected.id&&<Check size={16}/>}</button>)}<button className="new-assignment"><Plus size={15}/>New assignment</button></div>}</div>
}

function ExecutiveSummary({assignment,notes,setNotes}){
 return <div className="workspace-grid"><div className="main-column"><Panel title="Assignment Snapshot" meta="The current state of the assignment"><div className="snapshot-grid">{[['Client',assignment.client],['Assignment Type',assignment.type],['Stage',assignment.stage],['Geography',assignment.location]].map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div></Panel><Panel title="Executive Summary" meta="AI-assisted and broker controlled" action={<Badge tone="good">Broker editable</Badge>}><textarea className="summary-editor" value={notes} onChange={e=>setNotes(e.target.value)} /><div className="editor-foot"><span>SCIIP will never overwrite broker edits.</span><button>Save update</button></div></Panel><Panel title="Current Intelligence" meta="Evidence-backed changes since your last visit"><div className="intelligence-list"><Intelligence icon={Activity} title="Market positioning changed" text={assignment.brief}/><Intelligence icon={Users} title="Relationship activity" text="Three assignment relationships have new activity or a recommended follow-up."/><Intelligence icon={BookOpen} title="Knowledge preserved" text="All evidence, edits, and assignment events remain in the permanent timeline."/></div></Panel></div><aside className="side-column"><PriorityCard assignment={assignment}/><HealthPanel assignment={assignment}/></aside></div>
}
function MorningBrief({assignment,brief,setBrief}){return <div className="workspace-grid"><div className="main-column"><div className="brief-hero"><div><span className="kicker">MONDAY MORNING BRIEF</span><h2>What changed and why it matters</h2><p>Generated from governed assignment, market, property, relationship, and company intelligence.</p></div><Sparkles size={30}/></div><Panel title="Broker Summary" meta="Edit the brief before sharing or preserving it"><textarea className="brief-editor" value={brief} onChange={e=>setBrief(e.target.value)}/><div className="editor-foot"><span>Last generated 7:04 AM · 8 evidence sources</span><button>Preserve brief</button></div></Panel><Panel title="Changes Requiring Attention"><div className="change-list"><Change tone="urgent" title={assignment.priority} source="Assignment intelligence" detail={assignment.brief}/><Change title="Relationship follow-up window opened" source="Relationship graph" detail="Recent activity indicates a timely reason to reconnect with three assignment relationships."/><Change title="Comparable evidence refreshed" source="Market intelligence" detail="Two recent transactions were added and linked to the assignment evidence set."/></div></Panel></div><aside className="side-column"><EvidenceCard/><Panel title="Brief Controls"><div className="control-list">{['Market activity','Comparable alerts','Competition alerts','Relationship updates','Company intelligence'].map(x=><label key={x}><input type="checkbox" defaultChecked/><span>{x}</span></label>)}</div></Panel></aside></div>}
function AssignmentHealth({assignment}){return <div className="workspace-grid"><div className="main-column"><Panel title="Assignment Health" meta="Actionable coverage and freshness indicators—not a broker score"><div className="health-detail">{assignment.health.map(([s,t],i)=><div key={t}><HealthIcon status={s}/><div><strong>{t}</strong><span>{s==='complete'?'No action required. Evidence is current and available.':'Review the linked evidence and resolve when appropriate.'}</span></div><button>Review <ChevronRight size={14}/></button></div>)}</div></Panel><Panel title="Coverage by Intelligence Domain"><div className="coverage-grid">{['Documents','Market','Comparables','Competition','Relationships','Knowledge'].map((x,i)=><div key={x}><span>{x}</span><strong>{i===2||i===4?'Needs attention':'Current'}</strong><small>{i===2||i===4?'Open items are available for review.':'Coverage is supported by current evidence.'}</small></div>)}</div></Panel></div><aside className="side-column"><PriorityCard assignment={assignment}/><Panel title="Governance"><div className="governance-note"><Sparkles size={18}/><p>SCIIP evaluates the assignment, identifies gaps, and explains recommendations. It never grades the broker.</p></div></Panel></aside></div>}
function GenericWorkspace({tab,assignment}){return <div className="workspace-grid"><div className="main-column"><Panel title={tab} meta={`${assignment.type} workspace`}><div className="empty-state"><div><BookOpen size={24}/></div><h2>{tab}</h2><p>This capability is registered to the {assignment.type} workspace and will inherit the assignment’s evidence, timeline, relationships, and persistent memory.</p><button>Open governed view <ArrowUpRight size={15}/></button></div></Panel></div><aside className="side-column"><PriorityCard assignment={assignment}/><HealthPanel assignment={assignment}/></aside></div>}
function Intelligence({icon:Icon,title,text}){return <div><span><Icon size={17}/></span><div><strong>{title}</strong><p>{text}</p></div><button><ChevronRight size={16}/></button></div>}
function Change({title,source,detail,tone=''}){return <div className={tone}><div className="change-dot"/><div><small>{source}</small><strong>{title}</strong><p>{detail}</p></div><button>View evidence</button></div>}
function PriorityCard({assignment}){return <Panel title="Today's Priority" meta="Highest-value next action"><div className="priority-card"><span>01</span><h3>{assignment.priority}</h3><p>SCIIP identified this from the latest assignment events and evidence coverage.</p><button>Open action <ArrowUpRight size={15}/></button></div></Panel>}
function HealthPanel({assignment}){return <Panel title="Attention" meta="Assignment-level indicators"><div className="mini-health">{assignment.health.slice(0,4).map(([s,t])=><div key={t}><HealthIcon status={s}/><span>{t}</span></div>)}</div></Panel>}
function EvidenceCard(){return <Panel title="Evidence" meta="Why this brief changed"><div className="evidence-stats"><div><strong>8</strong><span>Sources</span></div><div><strong>94%</strong><span>High confidence</span></div><div><strong>3</strong><span>New events</span></div></div><button className="wide-secondary">View evidence chain</button></Panel>}

function App(){
 const [nav,setNav]=useState(initialRoute.nav);const [collapsed,setCollapsed]=useState(false);const [assignment,setAssignment]=useState(()=>assignments.find(a=>a.id===initialRoute.assignmentId)||assignments[0]);const [selectedTab,setSelectedTab]=useState(initialRoute.tab||'Executive Summary');const [notes,setNotes]=useState(assignments[0].notes);const [brief,setBrief]=useState(assignments[0].brief);const scroller=useRef(null);
 const workspace=useMemo(()=>getWorkspaceDefinition(assignment.type),[assignment.type]);
 useEffect(()=>{const saved=memory.load(assignment.id);setSelectedTab(workspace.tabs.includes(saved.selectedTab)?saved.selectedTab:workspace.tabs[0]);setNotes(saved.notes||assignment.notes);setBrief(saved.brief||assignment.brief);requestAnimationFrame(()=>{if(scroller.current)scroller.current.scrollTop=saved.scrollPosition||0})},[assignment.id]);
 useEffect(()=>{memory.save(assignment.id,{selectedTab,notes,brief})},[assignment.id,selectedTab,notes,brief]);
 useEffect(()=>{const context={applicationId:PROPERTY_COMMAND_CENTER_APP.id,nav,assignmentId:assignment.id,assignmentType:assignment.type,selectedTab};replaceWorkspaceRoute({nav,assignmentId:assignment.id,tab:selectedTab},window.history,window.location);bridge.publishContext(context)},[nav,assignment.id,assignment.type,selectedTab]);
 useEffect(()=>{bridge.announceReady({assignmentId:assignment.id,selectedTab});return bridge.subscribe(PLATFORM_EVENTS.NAVIGATE,({destination})=>{if(destination?.applicationId&&destination.applicationId!==PROPERTY_COMMAND_CENTER_APP.id)return;if(destination?.nav)setNav(destination.nav);if(destination?.assignmentId){const next=assignments.find(a=>a.id===destination.assignmentId);if(next)setAssignment(next)}if(destination?.tab)setSelectedTab(destination.tab)})},[]);
 const switchAssignment=a=>{if(scroller.current)memory.save(assignment.id,{scrollPosition:scroller.current.scrollTop});setAssignment(a)};
 const content=selectedTab==='Executive Summary'?<ExecutiveSummary assignment={assignment} notes={notes} setNotes={setNotes}/>:selectedTab==='Property Digital Twin'?<PropertyDigitalTwinCenter assignment={assignment}/>:selectedTab==='Decision Intelligence'?<DecisionIntelligenceCenter assignment={assignment}/>:selectedTab==='Executive AI'?<ExecutiveAICommandCenter assignment={assignment}/>:selectedTab==='Enterprise Operations'?<EnterpriseOperationsCenter/>:selectedTab==='Enterprise Knowledge Graph'?<EnterpriseKnowledgeGraphCenter assignment={assignment}/>:selectedTab==='Real-Time Intelligence'?<RealTimeIntelligenceCenter assignment={assignment}/>:selectedTab==='Temporal Intelligence'?<TemporalPropertyIntelligenceCenter/>:selectedTab==='Evidence Inspector'?<EvidenceCertificationCenter/>:selectedTab==='Production Data Certification'?<ProductionDataCertificationCenter/>:selectedTab==='Enterprise Production'?<ProductionEnterpriseCenter/>:selectedTab==='Morning Brief'?<MorningBrief assignment={assignment} brief={brief} setBrief={setBrief}/>:selectedTab==='Assignment Health'?<AssignmentHealth assignment={assignment}/>:selectedTab==='SuperSheet Ingestion'?<SuperSheetIngestion assignment={assignment}/>:selectedTab==='Knowledge Graph'?<KnowledgeGraphWorkspace assignment={assignment}/>:selectedTab==='AI Assistant'?<AIPropertyCopilot assignment={assignment}/>:selectedTab==='GIS Intelligence'?<GISIntelligenceWorkspace assignment={assignment}/>:selectedTab==='Opportunity Intelligence'?<OpportunityIntelligenceWorkspace assignment={assignment}/>:selectedTab==='Platform Runtime'?<PlatformRuntimeCenter/>:selectedTab==='Market Intelligence'?<MarketIntelligenceCenter assignment={assignment}/>:selectedTab==='Intelligence Platform'?<IntelligencePlatformCenter assignment={assignment}/>:selectedTab==='Integration Platform'?<IntegrationPlatformCenter assignment={assignment}/>:selectedTab==='Enterprise Collaboration'?<EnterpriseCollaborationCenter assignment={assignment}/>:selectedTab==='Enterprise Foundation'?<EnterpriseFoundationCenter assignment={assignment} onNavigate={setSelectedTab}/>:selectedTab==='Executive Command Center'?<ExecutiveCommandCenter assignment={assignment} onNavigate={setSelectedTab}/>:selectedTab==='Action Center'?<BrokerActionCenter assignment={assignment}/>:<GenericWorkspace tab={selectedTab} assignment={assignment}/>;
 return <div className={`app ${collapsed?'collapsed':''}`}><aside className="sidebar"><div className="brand"><div className="brand-mark">S</div><div><strong>SCIIP</strong><span>Industrial Intelligence OS</span></div></div><nav>{primaryNav.map(([label,Icon])=><button key={label} className={nav===label?'active':''} onClick={()=>setNav(label)}><Icon size={19}/><span>{label}</span></button>)}</nav><div className="sidebar-foot"><span className="status-dot"/><div><strong>Release 1.0</strong><span>Product governed</span></div></div></aside><main><header className="topbar"><button className="icon-button" onClick={()=>setCollapsed(!collapsed)}>{collapsed?<PanelLeftOpen size={19}/>:<PanelLeftClose size={19}/>}</button><div className="global-search"><Search size={16}/><span>Search assignments, properties, markets…</span><kbd>⌘ K</kbd></div><div className="top-actions"><button><MessageSquareText size={17}/></button><div className="avatar">SC</div></div></header><section className="assignment-shell"><div className="assignment-command"><AssignmentPicker selected={assignment} onSelect={switchAssignment}/><div className="command-context"><div><span>STAGE</span><strong>{assignment.stage}</strong></div><div><span>LOCATION</span><strong><MapPin size={13}/>{assignment.location}</strong></div><div><span>UPDATED</span><strong><Clock3 size={13}/>{assignment.updated}</strong></div></div><button className="ask-button"><Sparkles size={16}/>Ask SCIIP</button></div><div className="workspace-meta"><span>{workspace.focus}</span><Badge>{workspace.type} workspace</Badge></div><div className="tab-strip">{workspace.tabs.map(tab=><button key={tab} className={selectedTab===tab?'active':''} onClick={()=>setSelectedTab(tab)}>{tab}</button>)}</div><div className="workspace-content" ref={scroller} onScroll={e=>memory.save(assignment.id,{scrollPosition:e.currentTarget.scrollTop})}>{content}</div></section></main></div>
}
createRoot(document.getElementById('root')).render(<App/>);

export { CanonicalPropertyIdentityCenter };

export { IdentityReviewGovernanceCenter };

export { GovernedIdentityDecisionExecutionCenter };

export { PropertyLifecycleIntelligenceCenter };

export { LifecycleMarketOutcomeClassificationCenter };
