#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const repo = path.resolve(process.argv[2] || process.cwd());
const app = path.join(repo, "apps", "property-command-center");
const componentsDir = path.join(app, "src", "components");
const sourceDataDir = path.join(app, "src", "production-validation");
const publicDataDir = path.join(app, "public", "production-validation-data");
const runtimeDir = path.join(app, "src", "production-validation");
const reportPath = path.join(repo, "reports", "release-5.6", "wave-2.8.4", "197.22.0-production-validation-data-externalization.json");

const datasets = [
  "temporal-intelligence-data.json",
  "canonical-property-identity-data.json",
  "identity-decision-execution-data.json",
  "property-lifecycle-intelligence-data.json",
  "lifecycle-market-outcome-classification-data.json"
];

function ensureFile(file) {
  if (!fs.existsSync(file)) throw new Error(`Missing required file: ${file}`);
}
function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}
function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

for (const name of datasets) ensureFile(path.join(sourceDataDir, name));
fs.mkdirSync(publicDataDir, { recursive: true });

const assets = [];
for (const name of datasets) {
  const from = path.join(sourceDataDir, name);
  const to = path.join(publicDataDir, name);
  fs.copyFileSync(from, to);
  assets.push({
    name,
    bytes: fs.statSync(to).size,
    sha256: sha256(to)
  });
}

write(path.join(runtimeDir, "useProductionValidationData.jsx"), `import{useEffect,useState}from'react';

const cache=new Map();

export function useProductionValidationData(fileName){
  const cached=cache.get(fileName);
  const[state,setState]=useState({data:cached||null,error:null,loading:!cached});

  useEffect(()=>{
    let active=true;
    const existing=cache.get(fileName);
    if(existing){
      setState({data:existing,error:null,loading:false});
      return()=>{active=false};
    }

    setState({data:null,error:null,loading:true});
    fetch(\`\${import.meta.env.BASE_URL}production-validation-data/\${fileName}\`)
      .then(response=>{
        if(!response.ok)throw new Error(\`Failed to load \${fileName}: HTTP \${response.status}\`);
        return response.json();
      })
      .then(data=>{
        cache.set(fileName,data);
        if(active)setState({data,error:null,loading:false});
      })
      .catch(error=>{
        if(active)setState({data:null,error,loading:false});
      });

    return()=>{active=false};
  },[fileName]);

  return state;
}

export function ProductionValidationDataBoundary({fileName,children}){
  const{data,error,loading}=useProductionValidationData(fileName);
  if(loading)return <section className="workspace-panel" role="status">Loading governed production data…</section>;
  if(error)return <section className="workspace-panel" role="alert"><h1>Production data unavailable</h1><p>{error.message}</p></section>;
  return children(data);
}
`);

const components = {
"TemporalPropertyIntelligenceCenter.jsx": `import React,{useMemo,useState}from'react';
import{ProductionValidationDataBoundary}from'../production-validation/useProductionValidationData.jsx';
const fmt=n=>new Intl.NumberFormat('en-US').format(Number(n||0));
const money=n=>n==null?'—':\`$\${Number(n).toFixed(2)}\`;
export default function TemporalPropertyIntelligenceCenter(){
 return <ProductionValidationDataBoundary fileName="temporal-intelligence-data.json">{data=><TemporalPropertyIntelligenceView data={data}/>}</ProductionValidationDataBoundary>;
}
function TemporalPropertyIntelligenceView({data}){
 const[type,setType]=useState('ALL');
 const events=useMemo(()=>data.events.filter(e=>type==='ALL'||e.eventType===type).slice().reverse().slice(0,250),[data,type]);
 const types=Object.keys(data.summary.eventByType||{}).sort();
 return <div className="temporal-center"><div className="temporal-hero"><div><span>GOVERNED MARKET HISTORY</span><h2>Temporal Property Intelligence</h2><p>Daily AIR CRE observations resolved into canonical property timelines and evidence-backed market events.</p></div><div className="cert-pill">{data.status}</div></div>
 <div className="temporal-kpis"><K label="Snapshot dates" value={fmt(data.summary.snapshotDates)}/><K label="Canonical properties" value={fmt(data.summary.canonicalProperties)}/><K label="Market events" value={fmt(data.summary.totalEvents)}/><K label="Latest availability" value={\`\${fmt(data.summary.latestAvailableSf)} SF\`}/></div>
 <section className="temporal-panel"><header><div><h3>Event Ledger</h3><p>{data.summary.firstDate} through {data.summary.latestDate} · removals are observations, not assumed transactions</p></div><select value={type} onChange={e=>setType(e.target.value)}><option value="ALL">All event types</option>{types.map(t=><option key={t}>{t}</option>)}</select></header><div className="event-table"><div className="event-head"><span>Date</span><span>Event</span><span>Property</span><span>Evidence</span></div>{events.map(e=><div className="event-row" key={e.eventId}><span>{e.effectiveDate}</span><span><b>{e.eventType.replaceAll('_',' ')}</b><small>{e.confidence}{e.inferred?' · inferred':''}</small></span><span><b>{e.address}</b><small>{e.city} · {e.region}</small></span><span><b>{e.changes?.length?e.changes.map(c=>\`\${c.field}: \${c.before??'—'} → \${c.after??'—'}\`).join(' · '):'Source observation'}</b><small>{e.evidence?.fileName} · p. {e.evidence?.page??'—'}</small></span></div>)}</div></section>
 <section className="temporal-panel"><header><div><h3>Event Distribution</h3><p>Append-only classification across the certified corpus</p></div></header><div className="event-distribution">{Object.entries(data.summary.eventByType||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=><div key={k}><span>{k.replaceAll('_',' ')}</span><strong>{fmt(v)}</strong></div>)}</div></section></div>;
}
function K({label,value}){return <div><span>{label}</span><strong>{value}</strong></div>}
`,
"CanonicalPropertyIdentityCenter.jsx": `import React,{useMemo,useState}from'react';
import{ProductionValidationDataBoundary}from'../production-validation/useProductionValidationData.jsx';
export default function CanonicalPropertyIdentityCenter(){
 return <ProductionValidationDataBoundary fileName="canonical-property-identity-data.json">{data=><CanonicalPropertyIdentityView data={data}/>}</ProductionValidationDataBoundary>;
}
function CanonicalPropertyIdentityView({data}){
 const[q,setQ]=useState('');
 const rows=useMemo(()=>data.identities.filter(x=>\`\${x.address} \${x.city} \${x.zip||''}\`.toLowerCase().includes(q.toLowerCase())).slice(0,250),[data,q]);
 return <section className="workspace-page"><header><p className="eyebrow">Governed Property Intelligence</p><h1>Canonical Property Identity</h1><p>Persistent, evidence-backed building identities with append-only alias history and review-gated fuzzy merge proposals.</p></header><div className="metric-grid"><article><strong>{data.summary.canonicalProperties.toLocaleString()}</strong><span>Canonical properties</span></article><article><strong>{data.summary.identitiesConsolidated.toLocaleString()}</strong><span>Identities consolidated</span></article><article><strong>{data.summary.aliasLinks.toLocaleString()}</strong><span>Alias links</span></article><article><strong>{data.summary.mergeProposals.toLocaleString()}</strong><span>Review proposals</span></article></div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search address, city, or ZIP"/><div className="data-table"><table><thead><tr><th>Canonical ID</th><th>Property</th><th>Observations</th><th>Aliases</th><th>Confidence</th></tr></thead><tbody>{rows.map(x=><tr key={x.canonicalPropertyId}><td>{x.canonicalPropertyId}</td><td>{x.address}<br/><small>{x.city} {x.zip}</small></td><td>{x.observationCount}</td><td>{x.sourcePropertyIds.length}</td><td>{x.identityConfidence}%</td></tr>)}</tbody></table></div></section>;
}
`,
"GovernedIdentityDecisionExecutionCenter.jsx": `import React from'react';
import{ProductionValidationDataBoundary}from'../production-validation/useProductionValidationData.jsx';
export default function GovernedIdentityDecisionExecutionCenter(){
 return <ProductionValidationDataBoundary fileName="identity-decision-execution-data.json">{data=><GovernedIdentityDecisionExecutionView data={data}/>}</ProductionValidationDataBoundary>;
}
function GovernedIdentityDecisionExecutionView({data}){const s=data.summary||{};return <section className="workspace-panel"><h1>Governed Identity Execution</h1><p>Approved identity decisions are executed through reversible, append-only relationships.</p><div className="metric-grid"><article><strong>{s.approvedDecisions||0}</strong><span>Approved</span></article><article><strong>{s.executedDecisions||0}</strong><span>Executed</span></article><article><strong>{s.activeRelationships||0}</strong><span>Active Relationships</span></article><article><strong>{s.eventsRemapped||0}</strong><span>Events Remapped</span></article></div></section>}
`,
"PropertyLifecycleIntelligenceCenter.jsx": `import React from'react';
import{ProductionValidationDataBoundary}from'../production-validation/useProductionValidationData.jsx';
export default function PropertyLifecycleIntelligenceCenter(){
 return <ProductionValidationDataBoundary fileName="property-lifecycle-intelligence-data.json">{data=><PropertyLifecycleIntelligenceView data={data}/>}</ProductionValidationDataBoundary>;
}
function PropertyLifecycleIntelligenceView({data}){const s=data.summary||{};const counts=s.eventTypeCounts||{};return <section aria-label="Property Lifecycle Intelligence"><h1>Property Lifecycle Intelligence</h1><p>Canonical, governed property histories derived from recalculated temporal events.</p><div><strong>{s.propertiesWithLifecycle||0}</strong> properties · <strong>{s.totalLifecycleEvents||0}</strong> lifecycle events</div><ul>{Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=><li key={k}>{k.replaceAll('_',' ')}: {v}</li>)}</ul></section>}
`,
"LifecycleMarketOutcomeClassificationCenter.jsx": `import React from'react';
import{ProductionValidationDataBoundary}from'../production-validation/useProductionValidationData.jsx';
export default function LifecycleMarketOutcomeClassificationCenter(){
 return <ProductionValidationDataBoundary fileName="lifecycle-market-outcome-classification-data.json">{data=><LifecycleMarketOutcomeClassificationView data={data}/>}</ProductionValidationDataBoundary>;
}
function LifecycleMarketOutcomeClassificationView({data}){const s=data.summary||{};const counts=s.outcomeCounts||{};return <section aria-label="Lifecycle Market Outcome Classification"><h1>Lifecycle Market Outcomes</h1><p>Evidence-linked outcome inferences derived from governed property lifecycle events.</p><div><strong>{s.propertiesClassified||0}</strong> properties · <strong>{s.totalInferences||0}</strong> inferences · <strong>{s.reviewRequired||0}</strong> require review</div><ul>{Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=><li key={k}>{k.replaceAll('_',' ')}: {v}</li>)}</ul></section>}
`
};

for (const [name, source] of Object.entries(components)) {
  const target = path.join(componentsDir, name);
  ensureFile(target);
  write(target, source);
}

const residual = [];
for (const name of Object.keys(components)) {
  const target = path.join(componentsDir, name);
  const source = fs.readFileSync(target, "utf8");
  if (/from\s*['"]\.\.\/production-validation\/[^'"]+\.json['"]/.test(source)) residual.push(name);
}
if (residual.length) throw new Error(`Static production-data imports remain: ${residual.join(", ")}`);

const result = {
  framework: "SCIIP_V5_6_PRODUCTION_VALIDATION_DATA_EXTERNALIZATION",
  version: "197.22.0",
  status: "PASSED",
  generatedAt: new Date().toISOString(),
  result: {
    datasetsExternalized: assets.length,
    componentsConverted: Object.keys(components).length,
    staticJsonImportsRemaining: residual.length,
    publicAssetBytes: assets.reduce((sum, item) => sum + item.bytes, 0),
    runtimeCache: true,
    basePathAware: true,
    thresholdRaised: false
  },
  assets
};
write(reportPath, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
