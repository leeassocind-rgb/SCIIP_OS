const ledgers=new Map();
const stable=v=>JSON.stringify(v,Object.keys(v||{}).sort());
export function appendTwinState({twinId,effectiveAt,state,evidenceId,actorId}){
 if(!twinId||!effectiveAt||!state||!actorId)throw new Error('Twin state requires twinId, effectiveAt, state, and actorId');
 const rows=ledgers.get(twinId)||[]; const key=`${twinId}|${effectiveAt}|${stable(state)}|${evidenceId||''}`;
 const prior=rows.find(r=>r.businessKey===key); if(prior)return prior;
 const row=Object.freeze({stateId:`STATE-${String(rows.length+1).padStart(6,'0')}`,businessKey:key,twinId,effectiveAt:new Date(effectiveAt).toISOString(),recordedAt:new Date().toISOString(),state:Object.freeze({...state}),evidenceId:evidenceId||null,actorId,appendOnly:true});
 ledgers.set(twinId,[...rows,row]); return row;
}
export function readTwinStates(twinId){return [...(ledgers.get(twinId)||[])];}
export function clearTwinStateLedger(){ledgers.clear();}
