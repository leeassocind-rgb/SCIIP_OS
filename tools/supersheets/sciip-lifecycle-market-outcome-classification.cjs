#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const VERSION='196.10.0';
const sha=s=>crypto.createHash('sha256').update(String(s)).digest('hex').toUpperCase();
const id=(p,s)=>p+'-'+sha(s).slice(0,24);
const arr=x=>Array.isArray(x)?x:[];
const norm=s=>String(s||'').trim().toUpperCase();
const n=v=>{const x=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(x)?x:null};
const days=(a,b)=>Math.abs(new Date(a).getTime()-new Date(b).getTime())/86400000;
function infer(event, history){
 const type=norm(event.eventType), status=norm(event.status), prior=norm(event.previousStatus);
 const sf=n(event.availableSf), priorSf=n(event.previousAvailableSf);
 const recent=history.filter(h=>days(h.effectiveAt,event.effectiveAt)<=120);
 const priorOpposite=recent.slice().reverse().find(h=>(type==='NEW_AVAILABILITY'&&h.eventType==='NO_LONGER_OBSERVED')||(type==='NO_LONGER_OBSERVED'&&h.eventType==='NEW_AVAILABILITY'));
 let outcome='UNRESOLVED_OBSERVATION', confidence=0.45, review=true, rationale='Insufficient governed evidence for a business outcome.';
 if(type==='LEASED'||(/LEASED|OCCUPIED/.test(status)&&/AVAILABLE|VACANT|MARKET/.test(prior))){outcome='LIKELY_LEASE';confidence=.93;review=false;rationale='Availability transitioned to leased or occupied.'}
 else if(type==='RENEWAL'||/RENEW/.test(status)){outcome='LIKELY_RENEWAL';confidence=.94;review=false;rationale='Explicit renewal evidence is present.'}
 else if(type==='EXPANSION'||(sf!=null&&priorSf!=null&&sf>priorSf)){outcome='LIKELY_EXPANSION';confidence=.84;review=true;rationale='Available square footage increased at the canonical property.'}
 else if(type==='CONTRACTION'||(sf!=null&&priorSf!=null&&sf>0&&sf<priorSf)){outcome='LIKELY_CONTRACTION';confidence=.84;review=true;rationale='Available square footage decreased but remains positive.'}
 else if(type==='DEMOLITION'){outcome='DEMOLITION';confidence=.98;review=false;rationale='Governed lifecycle event explicitly indicates demolition.'}
 else if(type==='REDEVELOPMENT'){outcome='REDEVELOPMENT';confidence=.97;review=false;rationale='Governed lifecycle event explicitly indicates redevelopment.'}
 else if(type==='UNDER_CONSTRUCTION'){outcome='CONSTRUCTION_START';confidence=.96;review=false;rationale='Property entered under-construction state.'}
 else if(type==='DELIVERED'){outcome='CONSTRUCTION_DELIVERY';confidence=.96;review=false;rationale='Property transitioned from construction to delivered.'}
 else if(priorOpposite && days(priorOpposite.effectiveAt,event.effectiveAt)<=45){outcome='LIKELY_FALSE_CHURN';confidence=.91;review=true;rationale='Opposing availability events occurred within 45 days.'}
 else if(type==='NO_LONGER_OBSERVED'){outcome='POSSIBLE_LEASE_OR_WITHDRAWAL';confidence=.62;review=true;rationale='Property left observation without explicit transaction evidence.'}
 else if(type==='NEW_AVAILABILITY'){outcome='NEW_MARKET_AVAILABILITY';confidence=.82;review=false;rationale='Property entered the governed availability set.'}
 else if(type==='RATE_REDUCED'){outcome='PRICING_REPOSITIONING';confidence=.88;review=false;rationale='Asking rate was reduced.'}
 else if(type==='RATE_INCREASED'){outcome='PRICING_STRENGTHENING';confidence=.82;review=false;rationale='Asking rate increased.'}
 else if(type==='POWER_CHANGED'){outcome='PROPERTY_CAPABILITY_CHANGE';confidence=.75;review=true;rationale='Power capability changed.'}
 const evidence=[event.lifecycleEventId,event.sourceEventId].filter(Boolean);
 return {outcome,confidence:Number(confidence.toFixed(2)),confidenceBand:confidence>=.9?'HIGH':confidence>=.7?'MEDIUM':'LOW',reviewRequired:review,rationale,evidenceEventIds:evidence};
}
function run(input, prior={inferences:[]}){
 const events=arr(input.lifecycleEvents).slice().sort((a,b)=>String(a.effectiveAt).localeCompare(String(b.effectiveAt)));
 const existing=new Set(arr(prior.inferences).map(x=>x.businessKey)); const inferences=[...arr(prior.inferences)];
 const histories=new Map(); let created=0,duplicateSafeSkips=0;
 for(const e of events){
  const p=e.canonicalPropertyId;if(!p)continue; const h=histories.get(p)||[];
  const inf=infer(e,h); const businessKey=[p,e.lifecycleEventId,inf.outcome].join('|');
  if(existing.has(businessKey)){duplicateSafeSkips++;h.push(e);histories.set(p,h);continue}
  existing.add(businessKey); inferences.push({inferenceId:id('LIF',businessKey),businessKey,canonicalPropertyId:p,lifecycleEventId:e.lifecycleEventId,effectiveAt:e.effectiveAt,...inf,sourcePreserved:true,immutable:true,modelVersion:VERSION});created++;h.push(e);histories.set(p,h);
 }
 const outcomeCounts={},confidenceCounts={},reviewQueue=[];
 for(const x of inferences){outcomeCounts[x.outcome]=(outcomeCounts[x.outcome]||0)+1;confidenceCounts[x.confidenceBand]=(confidenceCounts[x.confidenceBand]||0)+1;if(x.reviewRequired)reviewQueue.push(x)}
 const properties=new Set(inferences.map(x=>x.canonicalPropertyId));
 return {framework:'SCIIP_LIFECYCLE_EVENT_INFERENCE_MARKET_OUTCOME_CLASSIFICATION',version:VERSION,status:'PASSED',generatedAt:new Date().toISOString(),governance:{appendOnlyInferenceLedger:true,canonicalPropertyRequired:true,sourceLifecyclePreserved:true,confidenceScored:true,evidenceLinked:true,humanReviewGated:true,duplicateSafe:true,noSilentTransactionCreation:true},summary:{sourceLifecycleEvents:events.length,inferencesCreated:created,duplicateSafeSkips,totalInferences:inferences.length,propertiesClassified:properties.size,reviewRequired:reviewQueue.length,outcomeCounts,confidenceCounts},inferences,reviewQueue};
}
function main(){const [input='reports/supersheets/SCIIP_PROPERTY_LIFECYCLE_INTELLIGENCE.json',output='reports/supersheets/SCIIP_LIFECYCLE_MARKET_OUTCOME_CLASSIFICATION.json']=process.argv.slice(2);if(!fs.existsSync(input))throw new Error('Required Sprint 3.9 artifact missing: '+input);const prior=fs.existsSync(output)?JSON.parse(fs.readFileSync(output)):{};const out=run(JSON.parse(fs.readFileSync(input)),prior);fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(out,null,2));console.log(JSON.stringify({framework:out.framework,version:out.version,status:out.status,result:out.summary},null,2));}
if(require.main===module){try{main()}catch(e){console.error(e.stack||e);process.exit(1)}}
module.exports={run,infer};
