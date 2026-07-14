#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),cp=require("child_process"),crypto=require("crypto");
const ROOT=process.cwd();
const profile=(process.argv.find(a=>a.startsWith("--profile="))||"--profile=foundation").split("=")[1];
const policy=JSON.parse(fs.readFileSync(path.join(ROOT,"governance/production-certification-policy.json"),"utf8"));
if(!policy.profiles[profile]){console.error(`Unknown certification profile: ${profile}`);process.exit(2);}
function exists(p){return fs.existsSync(path.join(ROOT,p));}
function walk(d){const p=path.join(ROOT,d);if(!fs.existsSync(p))return[];return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
function textFiles(paths){return paths.filter(p=>/\.(gs|js|json|yml|yaml|md|html|txt)$/.test(p));}
function contains(paths,re){return paths.some(p=>{try{return re.test(fs.readFileSync(path.join(ROOT,p),"utf8"));}catch(_){return false;}});}
function run(script){try{cp.execFileSync(process.execPath,[path.join(ROOT,script)],{cwd:ROOT,stdio:"pipe",env:Object.assign({},process.env,{SCIIP_GOVERNANCE_ALLOW_NODE_MISMATCH:process.env.SCIIP_CERTIFICATION_VALIDATION==="1"?"1":(process.env.SCIIP_GOVERNANCE_ALLOW_NODE_MISMATCH||"")})});return {ok:true};}catch(e){return {ok:false,message:String(e.stderr||e.stdout||e.message).trim().slice(0,1000)};}}
function domain(name,checks){const failures=checks.filter(c=>!c.ok);return {name,status:failures.length?"NOT_CERTIFIED":"CERTIFIED",checks,failures:failures.map(f=>f.name)};}
const src=walk("src"),all=textFiles(walk("src").concat(walk("tools"),walk("scripts"),walk(".github")));
const architecture=run("tools/sciip-architecture-governance.js");
const repository=run("tools/sciip-repository-governance.js");
const domains={};
domains.runtime=domain("Runtime",[
 {name:"architecture-governance",ok:architecture.ok,detail:architecture.message||"passed"},
 {name:"repository-governance",ok:repository.ok,detail:repository.message||"passed"},
 {name:"canonical-runtime-namespace",ok:exists("src/shared/000_SCIIP_RuntimeNamespace.gs")},
 {name:"service-container",ok:exists("src/shared/002_SCIIP_ServiceContainer.gs")||contains(src,/SCIIP_SERVICE_CONTAINER/)}
]);
domains.storage=domain("Storage",[
 {name:"storage-runtime",ok:exists("src/shared/001_SCIIP_StorageRuntime.gs")},
 {name:"storage-backend",ok:exists("src/shared/SCIIP_StorageBackend.gs")||contains(src,/SCIIP_STORAGE_BACKEND/)},
 {name:"backend-contract",ok:contains(src,/GOOGLE_SHEETS/)&&contains(src,/BIGQUERY/)&&contains(src,/CLOUD_SQL/)&&contains(src,/FIRESTORE/)&&contains(src,/LOCAL_RUNTIME/)},
 {name:"no-direct-storage-writes",ok:(()=>{const p=path.join(ROOT,"governance/repository-governance-report.json");if(!fs.existsSync(p))return false;return JSON.parse(fs.readFileSync(p,"utf8")).directStorageWrites===0;})()}
]);
domains.gis=domain("GIS",[
 {name:"gis-service",ok:contains(src,/GISService/)},
 {name:"gis-engine",ok:exists("src/gis/CampusEngine.gs")||walk("src/gis").length>0},
 {name:"gis-processors",ok:walk("src/processors/gis").filter(p=>p.endsWith("Processor.gs")).length>=10}
]);
domains.knowledgeGraph=domain("Knowledge Graph",[
 {name:"graph-service",ok:contains(src,/GraphService/)},
 {name:"graph-node-service",ok:exists("src/graph/GraphNodeService.gs")},
 {name:"graph-edge-service",ok:exists("src/graph/GrapgEdgeService.gs")||exists("src/graph/GraphEdgeService.gs")},
 {name:"graph-processors",ok:walk("src/processors/graph").filter(p=>p.endsWith("Processor.gs")).length>=10}
]);
domains.ai=domain("AI",[
 {name:"intelligence-core",ok:walk("src/intelligence").length>=5},
 {name:"intelligence-processors",ok:walk("src/processors/intelligence").filter(p=>p.endsWith("Processor.gs")).length>=50},
 {name:"ai-service-boundary",ok:contains(src,/Intelligence|AIService|SignalInterpreter/)}
]);
domains.identity=domain("Identity",[
 {name:"identity-service",ok:contains(src,/IdentityService/)},
 {name:"identity-core",ok:walk("src/identity").length>=4},
 {name:"identity-processors",ok:walk("src/processors/identity").filter(p=>p.endsWith("Processor.gs")).length>=10}
]);
const html=walk("src").filter(p=>p.endsWith(".html"));
domains.ui=domain("UI",[
 {name:"ui-assets",ok:html.length>0,detail:`${html.length} HTML files`},
 {name:"ui-entrypoint",ok:contains(src,/HtmlService\.|createTemplateFromFile|createHtmlOutput/)}
]);
domains.api=domain("API",[
 {name:"api-entrypoint",ok:contains(src,/function\s+do(Get|Post)\s*\(/)},
 {name:"api-contract",ok:contains(src,/API_VERSION|OpenAPI|apiVersion/)}
]);
let secretFindings=[];
for(const p of all){let s="";try{s=fs.readFileSync(path.join(ROOT,p),"utf8");}catch(_){continue;}for(const raw of policy.secretPatterns){let re;try{re=new RegExp(raw,"m");}catch(_){continue;}if(re.test(s)){secretFindings.push(p);break;}}}
domains.security=domain("Security",[
 {name:"no-obvious-secrets",ok:secretFindings.length===0,detail:secretFindings.slice(0,10)},
 {name:"manifest",ok:exists("src/appsscript.json")},
 {name:"governance-enforced",ok:exists(".github/workflows/sciip-repository-governance.yml")}
]);
domains.deployment=domain("Deployment",[
 {name:"clasp-project",ok:exists(".clasp.json")},
 {name:"apps-script-manifest",ok:exists("src/appsscript.json")},
 {name:"ci-workflow",ok:exists(".github/workflows/sciip-repository-governance.yml")}
]);
const performanceEvidence=(()=>{try{return JSON.parse(fs.readFileSync(path.join(ROOT,"governance/performance-certification.json"),"utf8"));}catch(_){return null;}})();
domains.performance=domain("Performance",[
 {name:"benchmark-runner",ok:exists("tools/sciip-performance-benchmark.js")},
 {name:"performance-baseline",ok:exists("governance/performance-baseline.json")},
 {name:"performance-evidence",ok:!!performanceEvidence&&performanceEvidence.status==="PASSED",detail:performanceEvidence?performanceEvidence.certificateId:"missing"}
]);
domains.recovery=domain("Recovery",[
 {name:"checkpoint-script",ok:exists("scripts/sciip_repository_checkpoint.sh")},
 {name:"recovery-runbook",ok:exists("docs/SCIIP_RECOVERY_RUNBOOK.md")},
 {name:"restore-test",ok:exists("tools/tests/sciip-recovery-restore-test.js")}
]);
const required=policy.profiles[profile].requiredDomains,deferred=policy.profiles[profile].deferredDomains;
for(const d of deferred)if(domains[d]&&domains[d].status!=="CERTIFIED")domains[d].status="DEFERRED";
const blockers=required.filter(d=>!domains[d]||domains[d].status!=="CERTIFIED");
const status=blockers.length?"NOT_READY":profile==="production"?"PRODUCTION_READY":"FOUNDATION_CERTIFIED";
const body={framework:"SCIIP_PRODUCTION_READINESS_CERTIFICATION",version:policy.version,profile,status,certifiedAt:new Date().toISOString(),node:process.versions.node,requiredDomains:required,deferredDomains:deferred,blockers,domains};
body.certificateId=crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0,24).toUpperCase();
fs.writeFileSync(path.join(ROOT,`governance/production-certification-${profile}.json`),JSON.stringify(body,null,2)+"\n");
const md=[`# SCIIP_OS ${profile[0].toUpperCase()+profile.slice(1)} Certification`,``,`**Status:** ${status}`,``,`**Certificate:** ${body.certificateId}`,``,`## Domains`,...Object.entries(domains).map(([k,v])=>`- ${v.name}: **${v.status}**${v.failures.length?` — ${v.failures.join(", ")}`:""}`),``,`## Blockers`,...(blockers.length?blockers.map(x=>`- ${x}`):["- None"]),``].join("\n");
fs.writeFileSync(path.join(ROOT,`governance/production-certification-${profile}.md`),md);
console.log(JSON.stringify({status,profile,certificateId:body.certificateId,blockers,domains:Object.fromEntries(Object.entries(domains).map(([k,v])=>[k,v.status]))},null,2));
if(blockers.length)process.exit(1);
