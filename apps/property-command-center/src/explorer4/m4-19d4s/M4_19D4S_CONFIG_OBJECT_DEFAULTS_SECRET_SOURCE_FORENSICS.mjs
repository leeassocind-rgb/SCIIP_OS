#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,classifyLine,likelyConfigProps,sha} from "./M419D4SConfigSourceRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4r1a-true-runtime-contract-recovery.json");
const resultPath=path.join(ev,"m4-19d4s-lightbox-config-object-defaults-secret-source-forensics.json");
const auditPath=path.join(ev,"m4-19d4s-lightbox-config-source-audit.json");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

if(!fs.existsSync(prior)) block("M419D4S_PREREQUISITE_MISSING",{path:prior});
const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4R1A_NO_DIRECT_OR_ACCESSOR_LIGHTBOX_ENVIRONMENT_KEYS_FOUND_CONFIG_OBJECT_OR_DEFAULTS_FORENSICS_REQUIRED")
  block("M419D4S_M419D4R1A_CONFIG_OBJECT_FORENSICS_STATE_REQUIRED",{observed:pdoc?.state??null});

const seeds=[
  path.join(app,"server/lightbox/config.mjs"),
  path.join(app,"server/lightbox/proxy-server.mjs")
].filter(fs.existsSync);

const importRe=/(?:from\s+|import\s*\()\s*["']([^"']+)["']/g;
const queue=[...seeds], seen=new Set(), files=[];
while(queue.length){
  const p=queue.shift();
  if(seen.has(p)||!fs.existsSync(p)) continue;
  seen.add(p);
  let text; try{text=fs.readFileSync(p,"utf8")}catch{continue}
  files.push({p,text});
  for(const m of text.matchAll(importRe)){
    if(!m[1].startsWith(".")) continue;
    const base=path.resolve(path.dirname(p),m[1]);
    const cands=[base,base+".mjs",base+".js",base+".cjs",path.join(base,"index.mjs"),path.join(base,"index.js")];
    const hit=cands.find(x=>fs.existsSync(x)&&x.startsWith(app));
    if(hit) queue.push(hit);
  }
}

const findings=[];
const props=new Set();
for(const f of files){
  const rel=path.relative(repo,f.p);
  for(const prop of likelyConfigProps(f.text)) props.add(prop);
  const lines=f.text.split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
    const classes=classifyLine(lines[i]);
    if(classes.length){
      findings.push({
        file:rel,
        line:i+1,
        classes,
        snippet:lines[i].trim().slice(0,600)
      });
    }
  }
}

// Identify explicit object construction / defaults / readiness patterns without values.
const joined=files.map(f=>f.text).join("\n");
const hasConfigFactory=/create[A-Za-z0-9_]*Config|load[A-Za-z0-9_]*Config|resolve[A-Za-z0-9_]*Config/i.test(joined);
const hasDefaultObject=/\bdefault[A-Za-z0-9_]*\s*=\s*\{|\bdefaults?\s*:\s*\{/i.test(joined);
const hasConstructorInjection=/constructor\s*\([^)]*(config|options|settings)/i.test(joined);
const hasDirectObjectLiteral=/new\s+[A-Za-z0-9_]+\s*\(\s*\{[\s\S]{0,1200}(baseUrl|apiKey|clientId|timeout)/i.test(joined);
const hasSecretProvider=/keychain|keytar|secretmanager|vault|credentialprovider|secretprovider/i.test(joined);
const hasDotenv=/dotenv/i.test(joined);
const hasReadiness=/configured|isConfigured|readiness|LIGHTBOX_NOT_CONFIGURED/i.test(joined);

// Determine most likely branch.
let classification,next;
if(hasSecretProvider){
  classification="EXPLICIT_SECRET_PROVIDER_ABSTRACTION_PRESENT";
  next="M4.19D4T_LIGHTBOX_SECRET_PROVIDER_BINDING_READINESS_GATE";
}else if(hasConstructorInjection||hasDirectObjectLiteral){
  classification="CONFIGURATION_INJECTED_VIA_OBJECT_OR_CONSTRUCTOR";
  next="M4.19D4T_LIGHTBOX_CONFIG_OBJECT_BINDING_RECOVERY";
}else if(hasConfigFactory||hasDefaultObject||hasDotenv){
  classification="CONFIGURATION_FACTORY_DEFAULT_OR_LOADER_PRESENT";
  next="M4.19D4T_LIGHTBOX_CONFIG_FACTORY_DEFAULTS_BINDING_RECOVERY";
}else if(hasReadiness){
  classification="READINESS_LOGIC_PRESENT_BUT_CONFIGURATION_SOURCE_UNRESOLVED";
  next="M4.19D4T_LIGHTBOX_READINESS_IMPLEMENTATION_TARGETED_FORENSICS";
}else{
  classification="CONFIGURATION_SOURCE_NOT_RECOVERED_FROM_IMPORT_GRAPH";
  next="M4.19D4T_LIGHTBOX_BROADER_SERVER_BOOTSTRAP_CONFIG_SOURCE_FORENSICS";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4S_CONFIG_SOURCE_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  filesInspected:files.map(f=>path.relative(repo,f.p)),
  fileCount:files.length,
  configProperties:[...props].sort(),
  findings,
  capabilityFlags:{
    hasConfigFactory,
    hasDefaultObject,
    hasConstructorInjection,
    hasDirectObjectLiteral,
    hasSecretProvider,
    hasDotenv,
    hasReadiness
  },
  classification,
  sourceHashes:Object.fromEntries(files.map(f=>[path.relative(repo,f.p),sha(f.text)])),
  secretValuesCaptured:false,
  secretValuesExposed:false
};
write(auditPath,audit);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4S_LIGHTBOX_CONFIG_OBJECT_DEFAULTS_SECRET_SOURCE_FORENSICS_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  forensics:{
    classification,
    filesInspected:files.length,
    configProperties:[...props].sort(),
    hasConfigFactory,
    hasDefaultObject,
    hasConstructorInjection,
    hasDirectObjectLiteral,
    hasSecretProvider,
    hasDotenv,
    hasReadiness,
    environmentVariableBranchClosed:true,
    sourceMutationPerformed:false,
    processMutationPerformed:false,
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    secretValuesExposed:false
  },
  policy:{
    doNotAssumeOperatorSecretBindingYet:true,
    configurationSourceMustBeProvenBeforeBinding:true,
    noProxyRestart:true,
    noEnrichmentRetry:true
  },
  artifacts:{configSourceAudit:auditPath},
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
  nextMilestone:next
};
write(resultPath,out);
console.log(JSON.stringify(out,null,2));
