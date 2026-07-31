import { createExecutiveOutcomeViewModel } from './executiveOutcomeViewModel.js';
import { buildExecutiveOutcomeReviewQueue } from './executiveOutcomeReviewQueue.js';
import { createExecutiveOutcomeLineage } from './executiveOutcomeLineage.js';
export function createExecutiveOutcomeCommandCenterAdapter({maxItems=100}={}) {
  const items=new Map(); let ingested=0,duplicatesIgnored=0,failures=0,startedAt=null;
  const api={
    start(){startedAt ||= new Date().toISOString(); return api.snapshot('OPERATIONAL');},
    stop(){return api.snapshot('STOPPED');},
    ingest(summary={}){
      try{
        const vm=createExecutiveOutcomeViewModel(summary); if(items.has(vm.id)){duplicatesIgnored++;return Object.freeze({status:'DUPLICATE_IGNORED',item:items.get(vm.id)});}
        items.set(vm.id,vm);ingested++;while(items.size>maxItems)items.delete(items.keys().next().value);
        return Object.freeze({status:'INGESTED',item:vm,lineage:createExecutiveOutcomeLineage(vm)});
      }catch(error){failures++;return Object.freeze({status:'FAILED',error:String(error?.message||error)});}
    },
    getItems(){return Object.freeze([...items.values()]);},
    getReviewQueue(){return buildExecutiveOutcomeReviewQueue([...items.values()]);},
    getLineage(id){const item=items.get(id);return item?createExecutiveOutcomeLineage(item):null;},
    getDashboardModel(){const rows=[...items.values()];const completed=rows.filter(r=>r.classification==='COMPLETED').length;return Object.freeze({
      generatedAt:new Date().toISOString(),totalOutcomes:rows.length,completedOutcomes:completed,reviewRequired:rows.filter(r=>r.requiresReview).length,
      successRatePct:rows.length?Number(((completed/rows.length)*100).toFixed(2)):0,items:Object.freeze(rows),reviewQueue:buildExecutiveOutcomeReviewQueue(rows),readOnly:true
    });},
    snapshot(forced){return Object.freeze({status:forced||(startedAt?'OPERATIONAL':'READY'),startedAt,ingested,retainedItems:items.size,maxItems,duplicatesIgnored,failures,readOnly:true,workflowMutationAllowed:false,autonomousExecutionAllowed:false,decisionTraceability:true});}
  };return api;
}
