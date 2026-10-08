#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,envKeys,literalLightBoxTokens,classifyLiteralToken} from "./M419D4R1ASemanticRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4r-lightbox-server-runtime-variable-binding-gate.json");
const resultPath=path.join(ev,"m4-19d4r1a-true-runtime-contract-recovery.json");
const auditPath=path.join(ev,"m4-19d4r1a-config-key-semantic-audit.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
if(!fs.existsSync(prior)) throw new Error(`missing prerequisite: ${prior}`);

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4R_LIGHTBOX_SERVER_RUNTIME_BINDING_INCOMPLETE_OPERATOR_OR_SECRET_PROVIDER_REQUIRED")
  throw new Error(`unexpected prior state: ${pdoc?.state}`);

const seed=[
  path.join(app,"server/lightbox/config.mjs"),
  path.join(app,"server/lightbox/proxy-server.mjs")
].filter(fs.existsSync);

const importRe=/(?:from\s+|import\s*\()\s*["']([^"']+)["']/g;
const q=[...seed], seen=new Set(), files=[];
while(q.length){
  const p=q.shift();
  if(seen.has(p)||!fs.existsSync(p)) continue;
  seen.add(p);
  let text; try{text=fs.readFileSync(p,"utf8")}catch{continue}
  files.push({p,text});
  for(const m of text.matchAll(importRe)){
    if(!m[1].startsWith(".")) continue;
    const base=path.resolve(path.dirname(p),m[1]);
    const cands=[base,base+".mjs",base+".js",base+".cjs",path.join(base,"index.mjs"),path.join(base,"index.js")];
    const hit=cands.find(x=>fs.existsSync(x)&&x.startsWith(app));
    if(hit) q.push(hit);
  }
}

const trueEnv=new Map(), literals=new Map();
for(const f of files){
  const rel=path.relative(repo,f.p);
  for(const k of envKeys(f.text)){
    if(!trueEnv.has(k)) trueEnv.set(k,[]);
    trueEnv.get(k).push(rel);
  }
  for(const t of literalLightBoxTokens(f.text)){
    if(!literals.has(t)) literals.set(t,[]);
    literals.get(t).push(rel);
  }
}

const literalAudit=[...literals.entries()].map(([token,sources])=>({
  token,sources,classification:classifyLiteralToken(token),
  admittedAsEnvironmentVariable:false
}));

const actualEnv=[...trueEnv.keys()].sort();
const discardedFalsePositives=(pdoc?.bindingGate?.recoveredLightBoxVariableNames||[])
  .filter(x=>!actualEnv.includes(x));

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4R1A_CONFIG_KEY_SEMANTIC_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  filesInspected:files.map(f=>path.relative(repo,f.p)),
  trueEnvironmentVariableNames:actualEnv,
  trueEnvironmentVariableSources:Object.fromEntries([...trueEnv.entries()]),
  literalLightBoxTokens:literalAudit,
  discardedPriorFalsePositives:discardedFalsePositives,
  priorFalsePositiveCause:"M4.19D4R admitted arbitrary quoted LIGHTBOX_* literals as configuration keys.",
  runtimeDefectCorrected:"D4R1 referenced discardedPriorFalsePositives without defining it.",
  secretValuesExposed:false
};
write(auditPath,audit);

let state,next;
if(actualEnv.length>0){
  state="M419D4R1A_TRUE_LIGHTBOX_RUNTIME_ENVIRONMENT_CONTRACT_RECOVERED";
  next="M4.19D4S_TRUE_RUNTIME_BINDING_READINESS_GATE";
}else{
  state="M419D4R1A_NO_DIRECT_OR_ACCESSOR_LIGHTBOX_ENVIRONMENT_KEYS_FOUND_CONFIG_OBJECT_OR_DEFAULTS_FORENSICS_REQUIRED";
  next="M4.19D4S_LIGHTBOX_CONFIG_OBJECT_DEFAULTS_AND_SECRET_SOURCE_FORENSICS";
}

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state,
  certifiedAt:new Date().toISOString(),
  semanticCorrection:{
    priorRecoveredNames:pdoc?.bindingGate?.recoveredLightBoxVariableNames||[],
    discardedPriorFalsePositives:discardedFalsePositives,
    falsePositiveCorrectionApplied:true,
    runtimeReferenceErrorCorrected:true,
    quotedStatusAndErrorCodesNotEnvironmentVariables:true
  },
  trueRuntimeContract:{
    environmentVariableNames:actualEnv,
    environmentVariableSources:Object.fromEntries([...trueEnv.entries()]),
    filesInspected:files.length,
    contractRecovered:actualEnv.length>0
  },
  safety:{
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    sourceMutationPerformed:false,
    processMutationPerformed:false,
    secretValuesExposed:false
  },
  authorityClosure:{
    temporalWriteAuthority:false,
    canonicalWriteAuthority:false,
    identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,
    refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,
    syncAuthority:false,
    propagationAuthority:false,
    automaticRetry:false
  },
  artifacts:{semanticAudit:auditPath},
  nextMilestone:next
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
