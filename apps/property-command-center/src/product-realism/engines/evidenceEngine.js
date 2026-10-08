import{createEvidence}from'../domain.js';
const stable=(prefix,index)=>`${prefix}-${String(index+1).padStart(4,'0')}`;
export function buildEvidence(input){const evidence=[];
 input.marketStats.forEach((row,i)=>evidence.push(createEvidence({id:stable('EV-MARKET',i),sourceType:'SUPERSHEET',sourceName:'Market Statistics SuperSheet',sourceRecordId:row.submarket,observedAt:input.generatedAt,confidencePct:99,fields:row})));
 input.properties.forEach((row,i)=>evidence.push(createEvidence({id:stable('EV-PROPERTY',i),sourceType:'SUPERSHEET',sourceName:'Property Inventory SuperSheet',sourceRecordId:row.id,observedAt:input.generatedAt,confidencePct:98,fields:row})));
 input.comparables.forEach((row,i)=>evidence.push(createEvidence({id:stable('EV-COMP',i),sourceType:'SUPERSHEET',sourceName:'Comparable Transactions SuperSheet',sourceRecordId:row.id,observedAt:row.closedAt,confidencePct:97,fields:row})));
 input.requirements.forEach((row,i)=>evidence.push(createEvidence({id:stable('EV-REQ',i),sourceType:'SUPERSHEET',sourceName:'Requirements SuperSheet',sourceRecordId:row.id,observedAt:row.createdAt,confidencePct:96,fields:row})));
 input.relationships.forEach((row,i)=>evidence.push(createEvidence({id:stable('EV-REL',i),sourceType:'KNOWLEDGE_GRAPH',sourceName:'Relationship Resolution',sourceRecordId:row.id,observedAt:row.createdAt,confidencePct:94,fields:row})));
 return Object.freeze(evidence)}
