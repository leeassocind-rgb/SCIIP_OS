#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha} from "./M419D4BD34Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const bd2Path=path.join(ev,"m4-19d4bd2-correct-production-path-certification.json");
const bd2Manifest=path.join(ev,"m4-19d4bd2-production-consumption-path-certification-manifest.json");
const bbPre=path.join(ev,"m4-19d4bb-downstream-materialization-preauthorization-manifest.json");
const result=path.join(ev,"m4-19d4bd3-bound-build-materializer-invocation-certification.json");
const manifest=path.join(ev,"m4-19d4bd3-bound-build-materializer-invocation-manifest.json");
const audit=path.join(ev,"m4-19d4bd3-build-materializer-invocation-forensics-audit.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
  const o={
    contract:"SCIIP_EXPLORER_4_M4_19D4BD3_BOUND_BUILD_MATERIALIZER_INVOCATION_CERTIFICATION",
    version:"4.0-m4.19d4bd3",status,state,certifiedAt:new Date().toISOString(),...extra,
    authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
      externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
      syncAuthority:false,propagationAuthority:false,automaticRetry:false},
    safety:{networkRequestsPerformed:0,downstreamMaterializationPerformed:false,currentStateMutationPerformed:false,
      canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}
  };
  write(result,o); console.log(JSON.stringify(o,null,2)); process.exit(code);
}

for(const p of [bd2Path,bd2Manifest,bbPre]){
  if(!fs.existsSync(p)) done("BLOCKED","M419D4BD3_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
}
const bd2=JSON.parse(fs.readFileSync(bd2Path,"utf8"));
if(bd2.state!=="M419D4BD2_UNIQUE_BUILD_MATERIALIZATION_TARGET_CERTIFIED_EXECUTION_PREAUTHORIZATION_REQUIRED")
  done("BLOCKED","M419D4BD3_BD2_UNIQUE_BUILD_TARGET_STATE_REQUIRED",{observed:bd2.state},3);

const producer=bd2.certification?.uniqueBuildProducer?.path;
if(!producer||!fs.existsSync(producer))
  done("BLOCKED","M419D4BD3_CERTIFIED_BUILD_PRODUCER_MISSING",{producer},3);

const source=fs.readFileSync(producer,"utf8");
const producerSha256=sha(source);

/* Recover package-script invocations that explicitly reference the bound producer. */
const packageBindings=[];
for(const pp of [path.join(app,"package.json"),path.join(repo,"package.json")].filter(fs.existsSync)){
  try{
    const pkg=JSON.parse(fs.readFileSync(pp,"utf8"));
    for(const [name,cmd] of Object.entries(pkg.scripts??{})){
      const relFromPkg=path.relative(path.dirname(pp),producer);
      if(cmd.includes(path.basename(producer))||cmd.includes(relFromPkg)||cmd.includes(relFromPkg.replaceAll("\\","/")))
        packageBindings.push({mode:"PACKAGE_SCRIPT",packageJson:pp,name,command:cmd});
    }
  }catch{}
}

/* Recover CLI semantics from original producer only. */
const argvRefs=[...source.matchAll(/process\.argv(?:\[(\d+)\]|\.(?:slice)\((\d+)\))/g)]
  .map(m=>({index:m[1]?Number(m[1]):null,slice:m[2]?Number(m[2]):null,match:m[0]}));
const hasArgv2=argvRefs.some(x=>x.index===2 || (x.slice!==null&&x.slice<=2));
const hasArgv3=argvRefs.some(x=>x.index===3);
const hasMainGuard=/import\.meta\.url|process\.argv\[1\]|require\.main|main\s*\(/.test(source);

/* Identify explicit write/copy targets from string literals near write operations. */
const writeCallRegex=/(writeFileSync|writeFile|copyFileSync|copyFile|renameSync|outputFile)\s*\(([\s\S]{0,500}?)\)/g;
const writeCalls=[];
for(const m of source.matchAll(writeCallRegex)){
  const expr=m[2];
  const literals=[...expr.matchAll(/["'`]([^"'`\n]{3,260})["'`]/g)].map(x=>x[1]);
  writeCalls.push({fn:m[1],expr:expr.slice(0,500),literals});
}
const likelyTargets=[];
for(const w of writeCalls){
  for(const lit of w.literals){
    if(/\.(json|geojson|js|mjs)$/i.test(lit) || /public|explorer|inventory|spatial|lineage/i.test(lit))
      likelyTargets.push(lit);
  }
}
const uniqueTargets=[...new Set(likelyTargets)];

/* Determine a safe invocation contract. Prefer an exact package script.
   Otherwise allow direct CLI only when producer has no required arg beyond argv[1],
   or exactly one app/repo root arg at argv[2]. */
let binding=null;
if(packageBindings.length===1){
  binding={...packageBindings[0],producer,producerSha256};
}else if(packageBindings.length===0){
  if(!hasArgv2 && !hasArgv3){
    binding={mode:"DIRECT_NODE_NO_ARGS",producer,producerSha256,cwd:app};
  }else if(hasArgv2 && !hasArgv3){
    binding={mode:"DIRECT_NODE_WITH_APP_ROOT",producer,producerSha256,cwd:app,arg:"APP_ROOT"};
  }
}

write(audit,{
  contract:"SCIIP_EXPLORER_4_M4_19D4BD3_BUILD_MATERIALIZER_INVOCATION_FORENSICS_AUDIT",
  version:"4.0-m4.19d4bd3",generatedAt:new Date().toISOString(),
  producer,producerSha256,packageBindings,argvRefs,hasArgv2,hasArgv3,hasMainGuard,
  writeCalls,likelyOutputTargetLiterals:uniqueTargets,binding
});

if(!binding){
  done("PASSED","M419D4BD3_BUILD_MATERIALIZER_INVOCATION_NOT_UNIQUELY_CERTIFIED_EXECUTION_BLOCKED",{
    forensics:{producer,packageBindingCount:packageBindings.length,argvRefs,likelyOutputTargetLiterals:uniqueTargets},
    artifacts:{invocationForensicsAudit:audit},
    nextMilestone:"M4.19D4BD3A_BUILD_MATERIALIZER_ARGUMENT_AND_TARGET_RECONCILIATION"
  });
}

const pre=JSON.parse(fs.readFileSync(bbPre,"utf8"));
const obj={
  contract:"SCIIP_EXPLORER_4_M4_19D4BD3_BOUND_BUILD_MATERIALIZER_INVOCATION_MANIFEST",
  version:"4.0-m4.19d4bd3",generatedAt:new Date().toISOString(),
  producer,binding,likelyOutputTargetLiterals:uniqueTargets,
  sourceInventoryPath:pre.sourceInventoryPath,
  sourceInventorySha256:pre.sourceInventorySha256,
  sourceRecordIndex:pre.sourceRecordIndex,
  sourceRecordHash:pre.sourceRecordHash,
  canonicalPropertyId:pre.canonicalPropertyId,
  address:pre.address,
  availableSf:pre.availableSf,
  maximumExecutions:1,
  executionAuthorized:false,
  explicitAuthorizationRequired:true
};
write(manifest,obj);

done("PASSED","M419D4BD3_BOUND_BUILD_MATERIALIZER_INVOCATION_CERTIFIED_CONTROLLED_EXECUTION_PREAUTHORIZED",{
  certification:{producer,binding,likelyOutputTargetCount:uniqueTargets.length,maximumExecutions:1,executionAuthorized:false},
  artifacts:{invocationForensicsAudit:audit,boundInvocationManifest:manifest},
  nextMilestone:"M4.19D4BD4_CONTROLLED_BOUND_BUILD_MATERIALIZATION_EXECUTION_AND_POST_MATERIALIZATION_PARITY"
});
