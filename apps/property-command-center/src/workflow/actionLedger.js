const KEY='sciip.workflow.action-ledger.v1';
const memory=[];
const stable=value=>JSON.stringify(value,Object.keys(value).sort());
const hash=value=>{let h=0;for(let i=0;i<value.length;i++)h=(Math.imul(31,h)+value.charCodeAt(i))|0;return(h>>>0).toString(36).toUpperCase()};
function storage(){try{return globalThis.localStorage||null}catch{return null}}
export function readActionLedger(){const store=storage();if(!store)return[...memory];try{return JSON.parse(store.getItem(KEY)||'[]')}catch{return[]}}
export function appendActionEvent(event){
  const occurredAt=event.occurredAt||new Date().toISOString();const body={workflowId:event.workflowId,assignmentId:event.assignmentId,type:event.type,actor:event.actor||'BROKER',payload:event.payload||{},occurredAt};
  const id=event.id||`ACT-${hash(stable(body))}`;const entry=Object.freeze({id,...body});const current=readActionLedger();
  if(current.some(item=>item.id===id))return{entry,appended:false,duplicateSafe:true};
  const next=[...current,entry];const store=storage();if(store)store.setItem(KEY,JSON.stringify(next));else memory.push(entry);return{entry,appended:true,duplicateSafe:true};
}
export function workflowHistory(workflowId){return readActionLedger().filter(event=>event.workflowId===workflowId).sort((a,b)=>a.occurredAt.localeCompare(b.occurredAt))}
export function clearActionLedgerForTests(){const store=storage();if(store)store.removeItem(KEY);memory.splice(0,memory.length)}
