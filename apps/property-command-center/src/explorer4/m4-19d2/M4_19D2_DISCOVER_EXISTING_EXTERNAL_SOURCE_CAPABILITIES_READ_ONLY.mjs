#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,SAFE_ENV_NAME,redactValue,scoreCandidate,sha} from "./M419D2DiscoveryRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d1-external-refresh-source-connector-acquisition-manifest.json");
const out=path.join(ev,"m4-19d2-existing-external-source-capability-discovery-audit.json");

const write=x=>fs.writeFileSync(out,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{const x={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};write(x);console.log(JSON.stringify(x,null,2));process.exit(3)};

if(!fs.existsSync(prior)) block("M419D2_M419D1_MANIFEST_REQUIRED",{path:prior});
const p=JSON.parse(fs.readFileSync(prior,"utf8"));
if(p?.state!=="M419D1_EXTERNAL_SOURCE_CONFIGURATION_REQUIRED") block("M419D2_M419D1_CONFIGURATION_REQUIRED_STATE_EXPECTED",{observed:p?.state??null});

const roots=[path.join(app,"src"),path.join(app,"server"),path.join(app,"lib"),path.join(app,"api"),path.join(app,"services"),path.join(app,"connectors")];
const exts=new Set([".js",".mjs",".cjs",".ts",".tsx",".json",".env",".example",".md",".txt"]);
const denyDirs=new Set(["node_modules",".git","dist","build",".next","coverage"]);
const files=[];
function walk(d){
  if(!fs.existsSync(d)) return;
  for(const e of fs.readdirSync(d,{withFileTypes:true})){
    const f=path.join(d,e.name);
    if(e.isDirectory()){if(!denyDirs.has(e.name)) walk(f);continue}
    if(e.isFile() && (exts.has(path.extname(e.name)) || e.name.startsWith(".env"))) files.push(f);
  }
}
roots.forEach(walk);

const envNames=new Set();
const candidates=[];
const envPattern=/(?:process\.env\.|process\.env\[['"])([A-Z][A-Z0-9_]{2,})/g;
const envAssign=/^\s*([A-Z][A-Z0-9_]{2,})\s*=/gm;
const secretish=/(KEY|TOKEN|SECRET|PASSWORD|AUTH|CREDENTIAL)/i;

for(const f of files){
  let text;
  try{text=fs.readFileSync(f,"utf8")}catch{continue}
  if(text.length>2_000_000) continue;
  const localEnv=new Set();
  for(const re of [envPattern,envAssign]){
    re.lastIndex=0; let m;
    while((m=re.exec(text))!==null){ if(SAFE_ENV_NAME.test(m[1])){envNames.add(m[1]);localEnv.add(m[1])} }
  }
  const low=text.toLowerCase();
  const c={
    file:f,
    relativePath:path.relative(repo,f),
    fileSha:sha(text),
    hasHttp:/fetch\s*\(|axios|https?\.request|new URL\(/i.test(text),
    hasApi:/\bapi\b|endpoint|client|connector|provider/i.test(text),
    hasPropertyTerms:/property|parcel|building|industrial|real estate/i.test(text),
    hasAvailableSfTerms:/availablesf|available_sf|available sf/i.test(text),
    hasSourceTerms:/sourceprovenance|source snapshot|provider|source native/i.test(text),
    envNames:[...localEnv].sort()
  };
  c.score=scoreCandidate(c);
  if(c.score>=5) candidates.push(c);
}

candidates.sort((a,b)=>b.score-a.score||a.relativePath.localeCompare(b.relativePath));
const top=candidates.slice(0,50);

const envAudit=[...envNames].sort().map(name=>({
  name,
  category:secretish.test(name)?"SENSITIVE_NAME":"CONFIG_NAME",
  configuredInCurrentProcess:Object.prototype.hasOwnProperty.call(process.env,name),
  value: Object.prototype.hasOwnProperty.call(process.env,name)?redactValue(process.env[name]):"<unset>"
}));

const likelyRefreshCandidates=top.filter(c=>c.hasPropertyTerms && (c.hasHttp||c.hasApi));
const configurationReady=likelyRefreshCandidates.some(c=>c.envNames.some(n=>Object.prototype.hasOwnProperty.call(process.env,n)));

const result={
  contract:CONTRACT,version:VERSION,status:"PASSED",
  state:configurationReady?"M419D2_EXISTING_EXTERNAL_SOURCE_CAPABILITY_DISCOVERED_CONFIGURATION_CANDIDATE_READY":"M419D2_EXISTING_EXTERNAL_SOURCE_CAPABILITIES_AUDITED_CONFIGURATION_STILL_REQUIRED",
  certifiedAt:new Date().toISOString(),
  discovery:{
    filesScanned:files.length,
    environmentVariableNamesFound:envAudit.length,
    candidateIntegrationFiles:candidates.length,
    likelyPropertySourceCandidates:likelyRefreshCandidates.length,
    configurationReady,
    secretValuesExposed:false,
    networkRequestsPerformed:0,
    topCandidates:top,
    environmentAudit:envAudit
  },
  policy:{
    secretValuesMustRemainRedacted:true,
    noNetworkRequestDuringDiscovery:true,
    noConfigurationMutation:true,
    noCanonicalMutation:true,
    noTemporalMutation:true,
    noIdentityMutation:true,
    noEvidenceFabrication:true
  },
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,automaticRetry:false},
  artifacts:{discoveryAudit:out},
  nextMilestone:configurationReady?"M4.19D3_EXISTING_SOURCE_ADAPTER_BINDING_AND_DRY_RUN":"M4.19D3_EXTERNAL_SOURCE_CONFIGURATION_PLAN_AND_BINDING_SCAFFOLD"
};
write(result); console.log(JSON.stringify(result,null,2));
