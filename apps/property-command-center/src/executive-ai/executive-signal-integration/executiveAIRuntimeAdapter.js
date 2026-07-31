import { runExecutiveAI } from '../executiveAIRuntime.js';
import { registerExecutiveAISignalTypes } from './executiveAISignalDefinitions.js';
import { mapExecutiveAIResultToSignals } from './executiveAISignalMapper.js';
export function createExecutiveAIRuntimeAdapter({signalBus,maxHistory=100}={}){
 registerExecutiveAISignalTypes();const history=[];const seen=new Set();let processed=0,published=0,duplicatesIgnored=0,started=true;
 const run=input=>{if(!started)throw new Error('Executive AI Runtime Adapter is stopped');const operationId=input?.operationId||input?.correlationId;if(!operationId)throw new Error('Executive AI operation id is required');if(seen.has(operationId)){duplicatesIgnored++;return Object.freeze({status:'DUPLICATE_IGNORED',operationId})}seen.add(operationId);
 const result=runExecutiveAI({assignmentId:input.assignmentId,actorId:input.actorId,prompt:input.prompt,evidence:input.evidence||[],steps:input.steps||[]});
 const signals=mapExecutiveAIResultToSignals({operationId,assignmentId:input.assignmentId,propertyId:input.propertyId||null,occurredAt:input.occurredAt||new Date().toISOString(),result});
 const publications=signals.map(signal=>{const publication=signalBus?.publish?signalBus.publish(signal):null;if(publication)published++;return Object.freeze({status:publication?'PUBLISHED':'ADAPTER_READY',signal,publication})});
 const record=Object.freeze({id:`executive-ai-runtime-adapter:${operationId}`,operationId,result,signals,publications,readOnly:true,brokerApprovalRequired:true,autonomousConsequentialActions:'BLOCKED'});history.push(record);while(history.length>maxHistory)history.shift();processed++;return record};
 return Object.freeze({run,getHistory:()=>Object.freeze([...history]),snapshot:()=>Object.freeze({status:started?'OPERATIONAL':'STOPPED',processed,published,duplicatesIgnored,retainedRecords:history.length,signalBusIntegrated:Boolean(signalBus?.publish),evidenceGroundingRequired:true,explainabilityRequired:true,brokerApprovalRequired:true,autonomousConsequentialActions:'BLOCKED'}),stop(){started=false},start(){started=true}});
}
