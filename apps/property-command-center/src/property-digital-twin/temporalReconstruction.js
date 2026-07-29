export function reconstructTwinAt(states=[],asOf){
 const cutoff=new Date(asOf).getTime(); if(!Number.isFinite(cutoff))throw new Error('Valid asOf date required');
 const eligible=states.filter(x=>new Date(x.effectiveAt).getTime()<=cutoff).sort((a,b)=>new Date(a.effectiveAt)-new Date(b.effectiveAt));
 return Object.freeze(eligible.reduce((acc,row)=>({...acc,...row.state}),{}));
}
export function twinTimeline(states=[]){return [...states].sort((a,b)=>new Date(a.effectiveAt)-new Date(b.effectiveAt));}
