function id(v){return String(v??'').trim()}
export function buildExecutiveRelationships(input={}){const decision=id(input.decisionId),recommendation=id(input.recommendationId),outcome=id(input.outcomeId);if(!decision)throw new Error('decisionId required');const edges=[];
if(recommendation)edges.push({from:decision,to:recommendation,type:'RECOMMENDS'});
if(outcome)edges.push({from:decision,to:outcome,type:'PRODUCED_OUTCOME'});
for(const evidenceId of input.evidenceIds||[])if(id(evidenceId))edges.push({from:decision,to:id(evidenceId),type:'SUPPORTED_BY'});
for(const signalId of input.sourceSignalIds||[])if(id(signalId))edges.push({from:decision,to:id(signalId),type:'DERIVED_FROM_SIGNAL'});
return Object.freeze(edges.map(x=>Object.freeze({...x,metadata:Object.freeze({projection:'EXECUTIVE_KNOWLEDGE',readOnly:true})})))}
export function appendExecutiveRelationships(store,edges=[]){if(!store?.append)throw new Error('relationship store required');return Object.freeze(edges.map(edge=>store.append(edge)));}
