import React,{useMemo,useState}from'react';
import{BrainCircuit,Search,Route,ShieldCheck}from'lucide-react';
import{createEnterpriseIntelligenceRuntime}from'../enterprise-intelligence/runtime/index.js';
import{readGraph}from'../knowledge/graphStore.js';

const runtime=createEnterpriseIntelligenceRuntime();

export default function EnterpriseIntelligenceWorkspace(){
 const graph=useMemo(()=>readGraph(),[]);
 const[query,setQuery]=useState('');
 const[state,setState]=useState(()=>{
  runtime.hydrateGraph({nodes:graph.nodes||[],edges:graph.edges||[]});
  return runtime.getSnapshot();
 });
 const runSearch=()=>setState(runtime.runSearch({query}));
 const runReasoning=()=>{
  const start=state.search.results?.[0]?.nodeId;
  if(start)setState(runtime.runReasoning({startNodeId:start,maximumHops:3}));
 };
 return <section className="production-activation-center">
  <header className="production-activation-hero"><div><p>Phase 6 Intelligence</p><h1>Enterprise Intelligence Workspace</h1><p>Search, reason, and inspect governed evidence across the live SCIIP knowledge graph.</p></div><span className="production-activation-badge">EXECUTION DISABLED</span></header>
  <section className="production-kpis"><article><span>Graph nodes</span><strong>{state.graph.nodes.length}</strong></article><article><span>Graph edges</span><strong>{state.graph.edges.length}</strong></article><article><span>Search results</span><strong>{state.search.total||0}</strong></article><article><span>Reasoning findings</span><strong>{state.reasoning.findingCount||0}</strong></article></section>
  <div className="production-actions"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search properties, tenants, markets, people, or events"/><button className="primary" onClick={runSearch}><Search size={15}/> Search graph</button><button onClick={runReasoning}><Route size={15}/> Explain relationships</button></div>
  <div className="production-grid"><main className="production-panel"><header><BrainCircuit size={17}/><h2>Graph-native results</h2></header>{(state.search.results||[]).length?state.search.results.map(result=><div className="production-row" key={result.nodeId}><span><strong>{result.label}</strong><small>{result.type} · score {result.score} · {result.relationshipCount} relationships</small></span><b className="production-pill">{result.matchedTerms.join(', ')}</b></div>):<div className="production-row"><span><strong>No search results yet</strong><small>Search the governed graph to begin.</small></span></div>}</main>
  <aside className="production-panel"><header><ShieldCheck size={17}/><h2>Reasoning evidence</h2></header>{(state.reasoning.findings||[]).length?state.reasoning.findings.map(finding=><div className="production-row" key={finding.nodeId}><span><strong>{finding.node?.label||finding.nodeId}</strong><small>{finding.hops} hops · {finding.evidence.length} evidence relationships</small></span></div>):<div className="production-row"><span><strong>No reasoning path yet</strong><small>Select a result and explain its relationships.</small></span></div>}</aside></div>
 </section>;
}
