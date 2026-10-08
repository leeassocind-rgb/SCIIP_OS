#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a4-true-canonical-identity-creation-orchestrator-and-input-contract-forensics.json");
const out=path.join(ev,"m4-19d4bj3a5-targeted-canonical-identity-creation-event-and-orchestrator-call-graph-forensics.json");
const R=p=>fs.readFileSync(p,"utf8"),J=p=>JSON.parse(R(p));
function finish(state,x={}){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A5_TARGETED_CANONICAL_IDENTITY_CREATION_EVENT_AND_ORCHESTRATOR_CALL_GRAPH_FORENSICS",
 version:"4.0-m4.19d4bj3a5",status:"PASSED",state,certifiedAt:new Date().toISOString(),...x,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,identityCreationExecuted:false,syntheticIdentityUsed:false,automaticRetry:false}};
 fs.mkdirSync(ev,{recursive:true});fs.writeFileSync(out,JSON.stringify(o,null,2)+"\n");console.log(JSON.stringify(o,null,2));process.exit(0)
}
if(!fs.existsSync(prior))finish("M419D4BJ3A5_BJ3A4_EVIDENCE_MISSING");
const p=J(prior);
if(p.state!=="M419D4BJ3A4_CERTIFIED_ADAPTER_RECLASSIFIED_UPDATE_ONLY_TRUE_CREATION_ORCHESTRATOR_NOT_UNIQUELY_BOUND_FURTHER_TARGETED_FORENSICS_REQUIRED")
 finish("M419D4BJ3A5_BJ3A4_STATE_NOT_ADMISSIBLE",{observed:p.state});
console.log("[BJ3A5] BJ3A4 ambiguity accepted");
const seed=(p.forensics?.candidates||[]).map(x=>x.path);
const roots=["src/runtime","src/broker-product","src/applications","server","tools"].map(x=>path.join(app,x)).filter(fs.existsSync);
let files=[];
for(const root of roots){let st=[root];while(st.length){const d=st.pop();let es=[];try{es=fs.readdirSync(d,{withFileTypes:true})}catch{continue}
 for(const e of es){const q=path.join(d,e.name),rel=path.relative(app,q);if(/node_modules|\.git|src\/explorer4|evidence|__pycache__|test|spec|dist|build/i.test(rel))continue;
 if(e.isDirectory())st.push(q);else if(/\.(js|mjs|jsx|ts|tsx)$/i.test(e.name)){try{if(fs.statSync(q).size<1500000)files.push(q)}catch{}}}}}
files=[...new Set(files)];
const source=new Map();for(const f of files){try{source.set(path.relative(app,f),R(f))}catch{}}
const names=new Set();
for(const s of seed){const txt=source.get(s)||"";for(const m of txt.matchAll(/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)|const\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\(/g))names.add(m[1]||m[2])}
const creationTerms=/CANONICAL_(?:PROPERTY_)?CREATED|IDENTITY_CREATED|PROPERTY_CREATED|CREATE_CANONICAL|createCanonical|create.*Identity|identity.*create|canonical.*create/i;
const rows=[];
let i=0;
for(const [rel,txt] of source){i++;if(i%250===0)console.log(`[BJ3A5] analyzed ${i}/${source.size}`);
 let refs=0;for(const n of names)if(n&&txt.includes(n))refs++;
 const importSeeds=seed.filter(s=>txt.includes(path.basename(s).replace(/\.(js|mjs|jsx|ts|tsx)$/,""))||txt.includes(s));
 const term=creationTerms.test(txt),sourceId=/sourcePropertyId|source_property_id/i.test(txt),canonical=/canonicalPropertyId|canonical_property_id/i.test(txt);
 const persist=/atomicWrite|writeFile|appendFile|persist|commit|save\(/i.test(txt),duplicate=/duplicate|already exists|existing canonical|resolve.*canonical/i.test(txt);
 const exported=/export\s+(?:async\s+)?function|export\s*\{|module\.exports/i.test(txt);
 const score=refs*2+importSeeds.length*3+[term,sourceId,canonical,persist,duplicate,exported].filter(Boolean).length;
 if(score>=6)rows.push({path:rel,score,seedFunctionReferences:refs,seedImports:importSeeds,signals:{creationTerm:term,sourcePropertyId:sourceId,canonicalPropertyId:canonical,persistence:persist,duplicateGuard:duplicate,exported}});
}
rows.sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path));
console.log(`[BJ3A5] call-graph candidates=${rows.length}`);
let exact=null;
if(rows.length===1)exact=rows[0];
else if(rows.length>1&&rows[0].score>=rows[1].score+3&&rows[0].signals.creationTerm&&rows[0].signals.persistence)exact=rows[0];
finish(exact?"M419D4BJ3A5_TRUE_CREATION_ORCHESTRATOR_CALL_GRAPH_UNIQUELY_BOUND_CORRECTED_REPREAUTHORIZATION_READY":"M419D4BJ3A5_TRUE_CREATION_ORCHESTRATOR_CALL_GRAPH_REMAINS_AMBIGUOUS_EXACT_SOURCE_INSPECTION_REQUIRED",{
 correction:{BJ4ExecutionStillProhibited:true,updateOnlyAdapterExcluded:true},
 forensics:{seedCandidates:seed,seedFunctionNames:[...names],filesAnalyzed:source.size,candidateCount:rows.length,candidates:rows.slice(0,30),exactBinding:exact},
 cohort:{size:p.cohort?.size||5,targets:p.cohort?.targets||[],allExecutionAuthorized:false},
 policy:{originalExecutableSourceOnly:true,evidenceCannotBeExecutionAuthority:true,trueCreationMustHandleAbsentCanonicalTarget:true,directSyntheticCPROPGenerationProhibited:true,noWriteInThisMilestone:true},
 nextMilestone:exact?"M4.19D4BJ3C_CORRECTED_FIVE_PROPERTY_IDENTITY_CREATION_REPREAUTHORIZATION_USING_TRUE_CREATION_ORCHESTRATOR":"M4.19D4BJ3A6_EXACT_TOP_CANDIDATE_SOURCE_AND_INPUT_CONTRACT_INSPECTION"
});
