"use strict";
const assert=require("assert"),fs=require("fs"),os=require("os"),path=require("path");
const e=require("../intelligence/sciip-v9-sprint29a-autonomous-market-intelligence");
let n=0; const t=(name,fn)=>{fn();n++};
t("stable hash",()=>assert.equal(e.hash({b:2,a:1}),e.hash({a:1,b:2})));
t("rent",()=>assert.equal(e.classify({field:"rent"}).type,"RENTAL_RATE_CHANGED"));
t("vacancy",()=>assert.equal(e.classify({field:"vacancy"}).type,"AVAILABILITY_CHANGED"));
t("power",()=>assert.equal(e.classify({field:"power amps"}).type,"POWER_CHANGED"));
t("up",()=>assert.equal(e.classify({field:"rent",before:1,after:2}).direction,"UP"));
t("down",()=>assert.equal(e.classify({field:"rent",before:2,after:1}).direction,"DOWN"));
t("normalize sort",()=>assert.deepEqual(e.normalize([{id:"2"},{id:"1"}]).map(x=>x.observationId),["1","2"]));
t("score bounded",()=>assert(e.score(Array(20).fill({type:"POWER_CHANGED",direction:"UP"})).opportunityScore<=100));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"sciip29a-"));fs.mkdirSync(path.join(tmp,"input"),{recursive:true});
fs.writeFileSync(path.join(tmp,"input/daily.json"),JSON.stringify({observations:[
{id:"1",propertyId:"P-1",field:"rent",before:1,after:2,observedAt:"2026-07-25T00:00:00Z",sourceId:"S-1"},
{id:"1b",propertyId:"P-1",field:"rent",before:1,after:2,observedAt:"2026-07-25T00:00:00Z",sourceId:"S-1"},
{id:"2",propertyId:"P-2",field:"power amps",before:2000,after:4000,observedAt:"2026-07-25T00:00:00Z",sourceId:"S-2"}]}));
const r=e.run({repositoryRoot:tmp,inputFile:"input/daily.json",outputDir:"out",generatedAt:"2026-07-25T08:00:00Z"});
t("certified",()=>assert.equal(r.status,"AUTONOMOUS_MARKET_INTELLIGENCE_CERTIFIED"));
t("duplicate safe",()=>assert.equal(r.observationsProcessed,2));
t("events",()=>assert.equal(r.marketEventsGenerated,2));
t("rankings",()=>assert.equal(r.propertiesRanked,2));
t("zero writes",()=>assert.equal(r.governance.canonicalWrites,0));
t("commit disabled",()=>assert.equal(r.governance.commitEnabled,false));
for(const f of ["executive-morning-briefing.json","knowledge-graph-delta-candidate.json","digital-twin-delta-candidate.json"])t(f,()=>assert(fs.existsSync(path.join(tmp,"out",f))));
console.log(JSON.stringify({framework:"SCIIP_V9_SPRINT29A_AUTONOMOUS_MARKET_INTELLIGENCE_TEST",version:"v9.0-sprint29a.0",status:"PASSED",testsRun:n,failures:[]}));
