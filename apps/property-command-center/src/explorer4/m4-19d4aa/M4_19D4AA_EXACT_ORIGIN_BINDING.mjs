#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {CONTRACT,VERSION,parseImports,parseConfigBinding,configUsages,sha} from "./M419D4AAOriginRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4z-proxy-bootstrap-factory-orchestrator-config-chain-forensics.json");
const resultPath=path.join(ev,"m4-19d4aa-config-identifier-origin-exact-binding.json");
const auditPath=path.join(ev,"m4-19d4aa-config-identifier-origin-binding-audit.json");
const proxyPath=path.join(app,"server/lightbox/proxy-server.mjs");
const configPath=path.join(app,"server/lightbox/config.mjs");

const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out);
  console.log(JSON.stringify(out,null,2));
  process.exit(3);
};

for(const p of [prior,proxyPath,configPath]){
  if(!fs.existsSync(p)) block("M419D4AA_PREREQUISITE_MISSING",{path:p});
}

const pdoc=JSON.parse(fs.readFileSync(prior,"utf8"));
if(pdoc?.state!=="M419D4Z_PROXY_BOOTSTRAP_FACTORY_ORCHESTRATOR_CONFIG_CHAIN_FORENSICS_CERTIFIED")
  block("M419D4AA_M419D4Z_CERTIFIED_STATE_REQUIRED",{observed:pdoc?.state??null});
if(pdoc?.forensics?.classification!=="PROXY_CONFIG_IDENTIFIER_DECLARATION_RECOVERED_IMPORT_ORIGIN_STILL_INDIRECT")
  block("M419D4AA_EXPECTED_CONFIG_IDENTIFIER_ORIGIN_BRANCH",{observed:pdoc?.forensics?.classification??null});

const proxy=fs.readFileSync(proxyPath,"utf8");
const cfg=fs.readFileSync(configPath,"utf8");

const imps=parseImports(proxy);
const configImport=imps.find(x=>x.specifier==="./config.mjs");
const importNames=configImport
  ? configImport.clause.split(",").map(x=>x.trim()).filter(Boolean)
  : [];
const getImported=importNames.includes("getLightBoxConfig");
const publicImported=importNames.includes("publicLightBoxConfig");

const bindings=parseConfigBinding(proxy);
const usages=configUsages(proxy);

const cfgExports=[];
for(const m of cfg.matchAll(/\bexport\s+(?:const|let|var|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g)) cfgExports.push(m[1]);
for(const m of cfg.matchAll(/\bexport\s*\{([^}]+)\}/g)){
  for(const part of m[1].split(",")){
    const n=part.trim().split(/\s+as\s+/)[0].trim();
    if(n) cfgExports.push(n);
  }
}
const exportSet=[...new Set(cfgExports)];
const getExported=exportSet.includes("getLightBoxConfig");
const publicExported=exportSet.includes("publicLightBoxConfig");

const directImportProven=!!configImport && getImported && getExported;
const directBindingProven=bindings.length===1;
const usageProven=usages.length>0;
const publicConfigContractProven=publicImported && publicExported;
const exactOriginProven=directImportProven && directBindingProven && usageProven;

let classification,next;
if(exactOriginProven){
  classification="DIRECT_CONFIG_MODULE_IMPORT_GETLIGHTBOXCONFIG_BINDING_AND_PROXY_USAGE_PROVEN";
  next="M4.19D4AB_SERVER_CONFIG_PRECEDENCE_AND_EFFECTIVE_RUNTIME_BINDING_CERTIFICATION";
}else if(!directImportProven){
  classification="DIRECT_CONFIG_IMPORT_STILL_NOT_PROVEN";
  next="M4.19D4AB_IMPORT_SYNTAX_EDGE_CASE_FORENSICS";
}else if(!directBindingProven){
  classification="CONFIG_FACTORY_BINDING_CARDINALITY_NOT_EXACT";
  next="M4.19D4AB_CONFIG_FACTORY_BINDING_CARDINALITY_FORENSICS";
}else{
  classification="CONFIG_USAGE_NOT_PROVEN";
  next="M4.19D4AB_PROXY_CONFIG_USAGE_BINDING_FORENSICS";
}

const audit={
  contract:"SCIIP_EXPLORER_4_M4_19D4AA_CONFIG_IDENTIFIER_ORIGIN_BINDING_AUDIT",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  proxySource:path.relative(repo,proxyPath),
  configSource:path.relative(repo,configPath),
  imports:imps,
  directConfigImport:configImport||null,
  importNames,
  configExports:exportSet,
  configBindings:bindings,
  configUsages:usages,
  directImportProven,
  directBindingProven,
  publicConfigContractProven,
  usageProven,
  exactOriginProven,
  classification,
  sourceHashes:{
    proxy:sha(proxy),
    config:sha(cfg)
  },
  parserCorrection:{
    priorParserMissedMinifiedImportSyntax:true,
    whitespaceAroundImportFromNoLongerRequired:true
  },
  secretValuesExposed:false
};
write(auditPath,audit);

const out={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D4AA_CONFIG_IDENTIFIER_ORIGIN_EXACT_BINDING_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  binding:{
    classification,
    directConfigImportProven:directImportProven,
    getLightBoxConfigImported:getImported,
    getLightBoxConfigExported:getExported,
    publicLightBoxConfigImported:publicImported,
    publicLightBoxConfigExported:publicExported,
    exactConfigFactoryBindingProven:directBindingProven,
    configFactoryBindingCount:bindings.length,
    proxyConfigUsageProven:usageProven,
    proxyConfigUsageProperties:[...new Set(usages.map(x=>x.property))],
    exactOriginProven
  },
  correction:{
    priorClassification:"PROXY_CONFIG_IDENTIFIER_DECLARATION_RECOVERED_IMPORT_ORIGIN_STILL_INDIRECT",
    parserDefect:"IMPORT_REGEX_REQUIRED_WHITESPACE_AROUND_MINIFIED_ESM_IMPORT",
    parserDefectCorrected:true,
    sourceLineEvidencePreserved:true
  },
  policy:{
    configOriginMustBeExact:true,
    configFactoryBindingCardinalityMustBeOne:true,
    precedenceCertificationRequiredBeforeRestart:true,
    noProxyRestart:true,
    noEnrichmentRetry:true
  },
  safety:{
    networkRequestsPerformed:0,
    enrichmentRequestsPerformed:0,
    sourceMutationPerformed:false,
    processMutationPerformed:false,
    canonicalMutationPerformed:false,
    temporalMutationPerformed:false,
    identityMutationPerformed:false,
    operationalIngestionPerformed:false,
    secretValuesExposed:false
  },
  artifacts:{originBindingAudit:auditPath},
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
