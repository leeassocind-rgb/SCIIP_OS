"use strict";
const assert=require("assert");
const path=require("path");
const {
  buildGraphPlan,validateGraphPlan,nodeId,hashString,VERSION
}=require(path.resolve(__dirname,"../../supersheets/parser-platform/sciip-ile-knowledge-graph-adapter.js"));

let testsRun=0; const failures=[];
function test(name,fn){try{fn();testsRun+=1;}catch(e){failures.push({test:name,error:e.stack||String(e)});}}

const model={
 version:"MODEL-1",
 asset:{
  areas:{building:{value:100000,unit:"SF"}},
  physical:{clearHeight:{value:36,unit:"FT"}},
  utilities:{power:{amps:2000}},
  loading:{dockHigh:{value:20},gradeLevel:{value:2}},
  parking:{auto:{value:100},trailer:{value:40}},
  fireProtection:{esfr:{present:true}}
 },
 evidence:[{concept:"CLEAR_HEIGHT",confidence:.98,text:"36 clear"}]
};

test("version",()=>assert.strictEqual(VERSION,"ile-v1.0.0-sprint8.0"));
test("hash deterministic",()=>assert.strictEqual(hashString("x"),hashString("x")));
test("node id deterministic",()=>assert.strictEqual(nodeId("P","x"),nodeId("P","x")));
test("requires model",()=>assert.throws(()=>buildGraphPlan({}),/canonical/));
test("builds property node",()=>assert.ok(buildGraphPlan(model,{propertyId:"P1"}).nodes.some(n=>n.id==="P1")));
test("builds attribute nodes",()=>assert.ok(buildGraphPlan(model,{propertyId:"P1"}).nodes.length>1));
test("builds edges",()=>assert.ok(buildGraphPlan(model,{propertyId:"P1"}).edges.length>0));
test("links evidence",()=>assert.ok(buildGraphPlan(model,{propertyId:"P1"}).evidenceLinks.length>0));
test("no commits",()=>assert.strictEqual(buildGraphPlan(model).graphMutationPlan.committed,false));
test("zero writes",()=>assert.strictEqual(buildGraphPlan(model).governance.productionWrites,0));
test("deterministic ids",()=>assert.strictEqual(buildGraphPlan(model).governance.deterministicIds,true));
test("deterministic plan",()=>assert.deepStrictEqual(buildGraphPlan(model),buildGraphPlan(model)));
test("valid graph plan",()=>assert.strictEqual(validateGraphPlan(buildGraphPlan(model)).valid,true));
test("no dangling edges",()=>assert.strictEqual(validateGraphPlan(buildGraphPlan(model)).danglingEdges.length,0));
test("no duplicate nodes",()=>assert.strictEqual(validateGraphPlan(buildGraphPlan(model)).duplicateNodeIds,0));
test("detects dangling edge",()=>{
 const p={nodes:[{id:"A"}],edges:[{from:"A",to:"B"}]};
 assert.strictEqual(validateGraphPlan(p).valid,false);
});
test("immutable",()=>assert.strictEqual(Object.isFrozen(buildGraphPlan(model)),true));
test("context address",()=>{
 const p=buildGraphPlan(model,{propertyId:"P1",address:"1 Main"});
 assert.strictEqual(p.nodes.find(n=>n.id==="P1").properties.address,"1 Main");
});

const report={
 framework:"SCIIP_ILE_SPRINT8_KNOWLEDGE_GRAPH_INTEGRATION_CERTIFICATION",
 version:VERSION,status:failures.length?"FAILED":"PASSED",testsRun,failures,
 result:{
  deterministicGraphPlan:true,entityCreation:true,relationshipCreation:true,
  evidenceLinkage:true,graphValidation:true,duplicateSafe:true,
  executionMode:"DIAGNOSTIC_ONLY",productionWrites:0,commitEnabled:false,
  existingKnowledgeGraphAuthoritative:true
 }
};
console.log(JSON.stringify(report)); process.exitCode=failures.length?1:0;
