import {createExecutiveForecastScorecard} from './executiveForecastScorecard.js';
export function createExecutiveForecastEngine({maxSnapshots=100}={}){
  let status='READY',ingested=0,duplicatesIgnored=0; const rows=[],ids=new Set();
  const snapshot=()=>Object.freeze({status,ingested,retainedSnapshots:rows.length,duplicatesIgnored,readOnly:true,workflowMutationAllowed:false,autonomousExecutionAllowed:false,decisionTraceability:true});
  return Object.freeze({
    start(){status='OPERATIONAL';return snapshot();}, stop(){status='STOPPED';return snapshot();}, snapshot,
    ingest(row={}){const id=String(row.snapshotId||'');if(!id)throw new Error('snapshotId is required');if(ids.has(id)){duplicatesIgnored++;return Object.freeze({status:'DUPLICATE_IGNORED',snapshotId:id});} ids.add(id);rows.push(Object.freeze({...row}));ingested++;while(rows.length>maxSnapshots){const removed=rows.shift();ids.delete(removed.snapshotId);}return Object.freeze({status:'INGESTED',snapshotId:id});},
    getForecast(portfolioId='ENTERPRISE'){return createExecutiveForecastScorecard({portfolioId,history:rows.filter(r=>(r.portfolioId||'ENTERPRISE')===portfolioId)});},
    getHistory(){return Object.freeze([...rows]);}
  });
}
