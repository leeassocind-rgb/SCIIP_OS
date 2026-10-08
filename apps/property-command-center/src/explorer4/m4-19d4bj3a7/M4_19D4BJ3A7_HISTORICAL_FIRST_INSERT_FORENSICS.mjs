#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import crypto from"node:crypto";
const repo=path.resolve(process.argv[2]||"."),app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a6-exact-top-candidate-source-and-input-contract-inspection.json");
const out=path.join(ev,"m4-19d4bj3a7-historical-canonical-creation-event-producer-and-first-insert-forensics.json");
const txt=p=>fs.readFileSync(p,"utf8"),json=p=>JSON.parse(txt(p)),sha=s=>crypto.createHash("sha256").update(s).digest("hex");
function walk(d,o=[]){if(!fs.existsSync(d))return o;for(const e of fs.readdirSync(d,{withFileTypes:true})){let p=path.join(d,e.name);if(e.isDirectory()){if(!["node_modules",".git","dist","build","src/explorer4"].some(x=>p.includes(path.sep+x+path.sep)))walk(p,o)}else if(/\.(js|mjs|cjs|json)$/.test(e.name))o.push(p)}return o}
function emit(state,x={}){let o={contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A7_HISTORICAL_CANONICAL_CREATION_EVENT_PRODUCER_AND_FIRST_INSERT_FORENSICS",version:"4.0-m4.19d4bj3a7",status:"PASSED",state,certifiedAt:new Date().toISOString(),...x,authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,identityCreationExecuted:false,syntheticIdentityUsed:false,automaticRetry:false}};fs.mkdirSync(ev,{recursive:true});fs.writeFileSync(out,JSON.stringify(o,null,2)+"\n");console.log(JSON.stringify(o,null,2))}
if(!fs.existsSync(prior)){emit("M419D4BJ3A7_BJ3A6_EVIDENCE_MISSING");process.exit()}
const p=json(prior); console.log("[BJ3A7] BJ3A6 zero-candidate result accepted");
let files=[...walk(path.join(app,"src/runtime")), ...walk(path.join(app,"server")), ...walk(path.join(app,"tools"))];
console.log(`[BJ3A7] bounded historical source corpus=${files.length}`);
let hits=[];
for(let i=0;i<files.length;i++){let f=files[i],t;try{t=txt(f)}catch{continue}
 let rel=path.relative(app,f), creation=/CANONICAL_[A-Z0-9_]*(CREATE|CREATED|CREATION)|CREATE_CANONICAL|canonical.*creat/i.test(t);
 let first=/first[-_ ]?(insert|write|commit)|absent|not found|does not exist|ENOENT/i.test(t);
 let source=/sourcePropertyId|source_property_id/i.test(t), id=/canonicalPropertyId|canonical_property_id|CPROP-/i.test(t);
 let persist=/atomicWriteJson|writeAtomic|writeFileSync|appendFileSync|CANONICAL_CANARY_COMMIT/i.test(t);
 if(creation||first){let events=[...new Set([...t.matchAll(/['"`]([A-Z][A-Z0-9_]{5,})['"`]/g)].map(m=>m[1]).filter(x=>/CANONICAL|PROPERTY|IDENTITY|CREATE|COMMIT/.test(x)))].slice(0,30);
 let funcs=[...t.matchAll(/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(([^)]*)\)/g)].map(m=>({name:m[1],parameters:m[2].trim()})).slice(0,30);
 let score=(creation?6:0)+(first?5:0)+(source?4:0)+(id?3:0)+(persist?4:0);
 hits.push({path:rel,score,sha256:sha(t),signals:{creation,firstInsertOrAbsent:first,sourceBinding:source,canonicalIdentity:id,persistence:persist},events,functions:funcs});}
 if((i+1)%250===0)console.log(`[BJ3A7] analyzed ${i+1}/${files.length}`);
}
hits.sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));
let strong=hits.filter(h=>h.signals.creation&&h.signals.firstInsertOrAbsent&&h.signals.sourceBinding&&h.signals.canonicalIdentity&&h.signals.persistence);
console.log(`[BJ3A7] historical candidates=${hits.length}; strong first-insert candidates=${strong.length}`);
let exact=strong.length===1?strong[0]:null;
emit(exact?"M419D4BJ3A7_HISTORICAL_TRUE_CREATION_EVENT_PRODUCER_AND_FIRST_INSERT_PATH_UNIQUELY_PROVEN_REAUTHORIZATION_READY":"M419D4BJ3A7_HISTORICAL_FIRST_INSERT_PATH_REMAINS_AMBIGUOUS_EXACT_TOP_SOURCE_INSPECTION_REQUIRED",{
 forensics:{filesAnalyzed:files.length,candidateCount:hits.length,strongCandidateCount:strong.length,topCandidates:hits.slice(0,25),strongCandidates:strong.slice(0,15),exactBinding:exact},
 cohort:{size:p.cohort?.size||5,targets:p.cohort?.targets||[],allExecutionAuthorized:false},
 policy:{BJ4ExecutionStillProhibited:true,originalExecutableSourceOnly:true,trueCreationMustHandleAbsentCanonicalTarget:true,directSyntheticCPROPGenerationProhibited:true,noWriteInThisMilestone:true},
 nextMilestone:exact?"M4.19D4BJ3C_CORRECTED_FIVE_PROPERTY_IDENTITY_CREATION_REPREAUTHORIZATION_USING_TRUE_CREATION_PATH":"M4.19D4BJ3A8_EXACT_HISTORICAL_FIRST_INSERT_SOURCE_INSPECTION"
});
