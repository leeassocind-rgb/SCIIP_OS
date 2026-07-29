export function synchronizeTwin({profile,sourceRecords=[],previousSyncAt=null,now=new Date().toISOString()}){
 const accepted=sourceRecords.filter(x=>x&&x.authoritative!==false); const rejected=sourceRecords.length-accepted.length;
 const merged=accepted.reduce((a,x)=>({...a,...(x.data||{})}),{...profile});
 return Object.freeze({twinId:profile.twinId,status:rejected?'REVIEW_REQUIRED':'SYNCHRONIZED',synchronizedAt:now,previousSyncAt,acceptedSources:accepted.length,rejectedSources:rejected,merged:Object.freeze(merged)});
}
