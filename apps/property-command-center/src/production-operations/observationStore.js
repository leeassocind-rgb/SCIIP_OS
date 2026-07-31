const clone=v=>JSON.parse(JSON.stringify(v));
export function createObservationStore(seed=[]) {
  const observations=seed.map(clone); const keys=new Set(observations.map(o=>o.idempotencyKey));
  return Object.freeze({
    append(input={}) {
      const idempotencyKey=input.idempotencyKey || [input.sourceId,input.propertyId,input.observedAt,input.kind||'PROPERTY'].join('|');
      if(keys.has(idempotencyKey)) return {duplicate:true,observation:clone(observations.find(o=>o.idempotencyKey===idempotencyKey))};
      const observation={observationId:input.observationId||`OBS-${String(observations.length+1).padStart(8,'0')}`,idempotencyKey,sourceId:input.sourceId,propertyId:input.propertyId,kind:input.kind||'PROPERTY',facts:clone(input.facts||{}),evidenceIds:[...(input.evidenceIds||[])],observedAt:input.observedAt||new Date().toISOString(),recordedAt:input.recordedAt||new Date().toISOString()};
      observations.push(observation); keys.add(idempotencyKey); return {duplicate:false,observation:clone(observation)};
    },
    timeline(propertyId) { return clone(observations.filter(o=>o.propertyId===propertyId).sort((a,b)=>String(a.observedAt).localeCompare(String(b.observedAt)))); },
    currentState(propertyId) { return this.timeline(propertyId).reduce((state,o)=>({...state,...o.facts}),{}); },
    list(){return clone(observations);}, count(){return observations.length;}
  });
}
