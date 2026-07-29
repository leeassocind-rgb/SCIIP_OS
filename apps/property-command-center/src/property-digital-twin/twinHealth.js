const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
export function scoreTwinHealth({profile={},lastSynchronizedAt,evidenceCoveragePct=0,conflictCount=0}){
 const completeness=['address','city','physical','location'].filter(k=>profile[k]!=null).length/4*40;
 const ageDays=lastSynchronizedAt?Math.max(0,(Date.now()-new Date(lastSynchronizedAt))/86400000):999;
 const freshness=ageDays<=1?30:ageDays<=7?22:ageDays<=30?12:0;
 const evidence=Math.max(0,Math.min(20,Number(evidenceCoveragePct||0)*.2)); const conflicts=Math.min(20,Number(conflictCount||0)*5);
 const score=clamp(completeness+freshness+evidence+10-conflicts);
 return Object.freeze({score,status:score>=85?'HEALTHY':score>=65?'WATCH':'ATTENTION_REQUIRED',freshnessDays:Math.round(ageDays*10)/10,conflictCount:Number(conflictCount||0)});
}
