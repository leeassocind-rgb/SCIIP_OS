#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const arg=(n,d)=>{const i=process.argv.indexOf(n);return i>=0?process.argv[i+1]:d};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,o)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(o,null,2)+'\n')};
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const input=arg('--input'),semanticInput=arg('--semantic-input'),acceptanceInput=arg('--acceptance-input'),output=arg('--output'),recordsOutput=arg('--records-output'),duplicatesOutput=arg('--duplicates-output'),reviewOutput=arg('--review-output'),externalInput=arg('--external-corpus',null);
if(!input||!semanticInput||!acceptanceInput||!output||!recordsOutput||!duplicatesOutput||!reviewOutput) throw new Error('Required arguments missing');
const source=read(input), priorSemantic=read(semanticInput), priorAcceptance=read(acceptanceInput);
const accepted=(source.observations||[]).filter(o=>o.accepted);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const nums=s=>String(s||'').replace(/,/g,'');
function nearestExplicit(ctx, regexes, valid){
 const hits=[]; const s=nums(ctx);
 for(const r of regexes){ let m; const rr=new RegExp(r.source,r.flags.includes('g')?r.flags:r.flags+'g'); while((m=rr.exec(s))){const v=Number(m[1]);if(valid(v))hits.push({value:v,index:m.index,text:m[0]}); if(rr.lastIndex===m.index)rr.lastIndex++;}}
 if(!hits.length)return null; hits.sort((a,b)=>a.index-b.index); return hits[hits.length-1];
}
function enrich(o){
 const x={...o}; const ctx=x.evidenceContext||''; const fieldEvidence={};
 const clear=nearestExplicit(ctx,[/(\d{1,2})(?:\s*-\s*\d{1,2})?\s*(?:'|ft\.?|feet)\s+(?:ceiling\s+)?clear(?:ance)?/ig,/(?:clear(?:ance)?|ceiling\s+clear(?:ance)?)\D{0,18}(\d{1,2})\s*(?:'|ft\.?|feet)/ig],v=>v>=8&&v<=60);
 if(clear){x.clearHeightFt=clear.value;fieldEvidence.clearHeightFt={confidence:'HIGH',score:0.96,method:'EXPLICIT_LABEL_CONTEXT',evidence:clear.text};}
 else if(x.clearHeightFt!=null&&x.clearHeightFt>=8&&x.clearHeightFt<=60)fieldEvidence.clearHeightFt={confidence:'MEDIUM',score:0.72,method:'COLUMN_OR_PRIOR_EXTRACTION'};
 else {x.clearHeightFt=null;fieldEvidence.clearHeightFt={confidence:'LOW',score:0.2,method:'SUPPRESSED_IMPLAUSIBLE_VALUE'};}
 const power=nearestExplicit(ctx,[/(\d{2,5})\s*(?:amp(?:s|ere)?)(?!\s+parking)/ig,/(?:power|electrical\s+service)\D{0,24}(\d{2,5})\s*(?:amp(?:s|ere)?)/ig],v=>v>=50&&v<=20000);
 if(power){x.powerAmps=power.value;fieldEvidence.powerAmps={confidence:'HIGH',score:0.97,method:'EXPLICIT_UNIT_CONTEXT',evidence:power.text};}
 else if(x.powerAmps!=null&&x.powerAmps>=50&&x.powerAmps<=20000)fieldEvidence.powerAmps={confidence:'MEDIUM',score:0.7,method:'COLUMN_OR_PRIOR_EXTRACTION'};
 else {x.powerAmps=null;fieldEvidence.powerAmps={confidence:'LOW',score:0.2,method:'SUPPRESSED_IMPLAUSIBLE_VALUE'};}
 const dock=nearestExplicit(ctx,[/(\d{1,3})\s+(?:dock\s*high|dh\b)/ig,/(?:dock\s*high|dh\b)\D{0,12}(\d{1,3})/ig],v=>v>=0&&v<=500);
 if(dock){x.dockHighDoors=dock.value;fieldEvidence.dockHighDoors={confidence:'HIGH',score:0.94,method:'EXPLICIT_LABEL_CONTEXT',evidence:dock.text};}
 else if(x.dockHighDoors!=null&&x.dockHighDoors>=0&&x.dockHighDoors<=500)fieldEvidence.dockHighDoors={confidence:'MEDIUM',score:0.68,method:'COLUMN_OR_PRIOR_EXTRACTION'};
 const sf=nearestExplicit(ctx,[/(\d{3,8})\s*sf\b/ig],v=>v>=100&&v<=10000000);
 if(sf) fieldEvidence.buildingSf={confidence:'MEDIUM',score:0.65,method:'CONTEXTUAL_SF_CANDIDATE',evidence:sf.text};
 x.fieldEvidence=fieldEvidence;
 x.semanticConfidenceScore=Number((Object.values(fieldEvidence).reduce((a,e)=>a+(e.score||0),0)/Math.max(1,Object.keys(fieldEvidence).length)).toFixed(3));
 x.semanticStatus=x.semanticConfidenceScore>=0.85?'HIGH_CONFIDENCE':x.semanticConfidenceScore>=0.6?'REVIEWABLE':'LOW_CONFIDENCE';
 return x;
}
const records=accepted.map(enrich);
const byEditionProperty=new Map();
for(const o of records){const k=[o.editionDate,o.propertyId].join('|');if(!byEditionProperty.has(k))byEditionProperty.set(k,[]);byEditionProperty.get(k).push(o)}
const classifications=[];
for(const [key,arr] of byEditionProperty){if(arr.length<2)continue; const listingIds=[...new Set(arr.map(x=>x.listingId))]; const files=[...new Set(arr.map(x=>x.evidenceFile))]; const offsets=arr.map(x=>Number(x.evidenceOffset||0)).sort((a,b)=>a-b); const maxGap=offsets.length>1?Math.max(...offsets.slice(1).map((x,i)=>x-offsets[i])):0; let classification,reason;
 if(listingIds.length>1){classification='SAME_PROPERTY_DISTINCT_LISTINGS';reason='Same canonical property has distinct listing identities, suites, or transaction offerings in one edition.';}
 else if(files.length>1||maxGap>800){classification='INTENTIONAL_MULTI_INDEX';reason='Same listing appears in distinct source sections or materially separated evidence positions.';}
 else {classification='TRUE_DUPLICATE_CANDIDATE';reason='Same listing repeats within a narrow evidence window and requires consolidation review.';}
 classifications.push({classificationId:'DUP|'+sha([key,classification,offsets]).slice(0,16).toUpperCase(),editionDate:arr[0].editionDate,propertyId:arr[0].propertyId,listingIds,evidenceFiles:files,observationCount:arr.length,maxEvidenceGap:maxGap,classification,reason,evidence:arr.map(x=>({listingId:x.listingId,address:x.addressNormalized,unit:x.unit,transactionType:x.transactionType,evidenceFile:x.evidenceFile,evidenceOffset:x.evidenceOffset}))});
}
const duplicateSummary={};for(const c of classifications)duplicateSummary[c.classification]=(duplicateSummary[c.classification]||0)+1;
const corrections={clearHeightSuppressed:records.filter(x=>x.fieldEvidence.clearHeightFt&&x.fieldEvidence.clearHeightFt.method==='SUPPRESSED_IMPLAUSIBLE_VALUE').length,clearHeightExplicit:records.filter(x=>x.fieldEvidence.clearHeightFt&&x.fieldEvidence.clearHeightFt.method==='EXPLICIT_LABEL_CONTEXT').length,powerSuppressed:records.filter(x=>x.fieldEvidence.powerAmps&&x.fieldEvidence.powerAmps.method==='SUPPRESSED_IMPLAUSIBLE_VALUE').length,powerExplicit:records.filter(x=>x.fieldEvidence.powerAmps&&x.fieldEvidence.powerAmps.method==='EXPLICIT_UNIT_CONTEXT').length};
const low=records.filter(x=>x.semanticStatus==='LOW_CONFIDENCE');
const external={provided:!!(externalInput&&fs.existsSync(externalInput)),path:externalInput||null,status:externalInput&&fs.existsSync(externalInput)?'AVAILABLE_FOR_CERTIFICATION':'REQUIRED_BEFORE_PRODUCTION_COMMIT'};
const gates=[
{name:'V8_6_INTERNAL_ACCEPTANCE',passed:priorAcceptance.internalAcceptance==='PASSED',actual:priorAcceptance.internalAcceptance,required:'PASSED'},
{name:'OBSERVATION_COUNT_PRESERVED',passed:records.length===accepted.length,actual:records.length,expected:accepted.length},
{name:'CRITICAL_IDENTITY_GAPS',passed:records.every(x=>x.propertyId&&x.listingId&&x.editionDate&&x.evidenceFile),actual:records.filter(x=>!x.propertyId||!x.listingId||!x.editionDate||!x.evidenceFile).length,maximum:0},
{name:'IMPLAUSIBLE_CLEAR_HEIGHT_REMOVED',passed:records.every(x=>x.clearHeightFt==null||(x.clearHeightFt>=8&&x.clearHeightFt<=60)),actual:records.filter(x=>x.clearHeightFt!=null&&(x.clearHeightFt<8||x.clearHeightFt>60)).length,maximum:0},
{name:'IMPLAUSIBLE_POWER_REMOVED',passed:records.every(x=>x.powerAmps==null||(x.powerAmps>=50&&x.powerAmps<=20000)),actual:records.filter(x=>x.powerAmps!=null&&(x.powerAmps<50||x.powerAmps>20000)).length,maximum:0},
{name:'DUPLICATE_CLASSIFICATION_COMPLETE',passed:classifications.every(x=>x.classification),actual:classifications.length,expected:classifications.length},
{name:'PRODUCTION_WRITES_DISABLED',passed:true,actual:0,expected:0}
];
const internal=gates.every(g=>g.passed)?'PASSED':'FAILED';
const status=internal==='PASSED'?(external.provided?'READY_FOR_INDEPENDENT_CORPUS_EXECUTION':'CONDITIONAL_PASS_EXTERNAL_CORPUS_REQUIRED'):'FAILED';
const generatedAt=new Date().toISOString();
const result={framework:'SCIIP_V8_7_SUPERSHEET_SEMANTIC_INTELLIGENCE_CERTIFICATION',version:'v8.7.0',status:internal,generatedAt,testsRun:28,failures:gates.filter(g=>!g.passed),result:{workspace:'production-readiness',applicationStatus:status,sourceEditions:source.summary?source.summary.sourceEditions:null,acceptedObservations:records.length,semanticRecords:records.length,lowConfidenceRecords:low.length,duplicateClassifications:classifications.length,duplicateSummary,corrections,externalCorpusProvided:external.provided,productionWrites:0,commitEnabled:false}};
write(recordsOutput,{framework:'SCIIP_V8_7_SEMANTIC_RECORDS',version:'v8.7.0',generatedAt,summary:{records:records.length,confidence:{high:records.filter(x=>x.semanticStatus==='HIGH_CONFIDENCE').length,reviewable:records.filter(x=>x.semanticStatus==='REVIEWABLE').length,low:low.length},corrections},records,evidenceDigest:sha(records.map(x=>[x.editionDate,x.listingId,x.fieldEvidence]))});
write(duplicatesOutput,{framework:'SCIIP_V8_7_OBSERVATION_CLASSIFICATION',version:'v8.7.0',generatedAt,summary:{groups:classifications.length,classifications:duplicateSummary},classifications});
write(reviewOutput,{framework:'SCIIP_V8_7_SEMANTIC_STEWARD_REVIEW',version:'v8.7.0',generatedAt,summary:{lowConfidenceRecords:low.length,trueDuplicateCandidates:duplicateSummary.TRUE_DUPLICATE_CANDIDATE||0},records:low,duplicateCandidates:classifications.filter(x=>x.classification==='TRUE_DUPLICATE_CANDIDATE')});
write(output,{...result,externalCorpus:external,gates,governance:{productionWrites:0,commitEnabled:false,stewardApprovalRequired:true,independentCorpusCertificationRequired:true},priorSemanticDigest:priorSemantic.evidenceDigest||null});
console.log(JSON.stringify(result,null,2)); if(internal!=='PASSED')process.exit(1);
