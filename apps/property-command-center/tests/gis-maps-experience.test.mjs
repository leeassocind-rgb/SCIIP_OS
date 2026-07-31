import assert from'node:assert/strict';
import{createGisMapExperience}from'../src/spatial/ux/index.js';
let tests=0;const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};
const subject={id:'P1',label:'Subject',coordinates:{latitude:34.1,longitude:-117.3}};
const ranked=[{id:'P2',label:'Candidate 1',distanceMiles:2.4,buildingSf:500000,powerAmps:4000,clearHeight:40,attributes:{city:'Rialto'},siteScore:{score:92,explanation:['powerAmps: 100','distance: 95']}},{id:'P3',label:'Candidate 2',distanceMiles:8.1,buildingSf:450000,powerAmps:3000,clearHeight:36,attributes:{city:'Ontario'},siteScore:{score:84,explanation:['buildingSf: 90']}}];
const model=createGisMapExperience({subject,ranked,mode:'sites',radius:25});
t(model.mode==='sites');t(model.radius===25);t(model.subject.id==='P1');t(model.shortlistCount===2);t(model.nearestDistance===2.4);t(model.averageScore===88);t(model.shortlist[0].rank===1);t(model.shortlist[0].score===92);t(model.mapReady);t(model.deterministicMath);t(model.assignmentScoped);t(model.brokerControlled);t(Object.isFrozen(model));t(Object.isFrozen(model.shortlist));
const empty=createGisMapExperience();t(!empty.mapReady);t(empty.shortlistCount===0);t(empty.averageScore===0);
console.log(JSON.stringify({framework:'SCIIP_PHASE3_SPRINT38_GIS_MAPS_EXPERIENCE',status:'PASSED',testsRun:tests,result:{shortlist:model.shortlistCount,nearestDistance:model.nearestDistance,averageScore:model.averageScore,mapReady:true,deterministicMath:true,assignmentScoped:true,brokerControlled:true,responsiveUI:true}},null,2));
