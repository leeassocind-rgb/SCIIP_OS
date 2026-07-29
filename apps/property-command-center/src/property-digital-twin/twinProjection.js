export function projectTwin({profile,currentState={},relationships=[],health,marketPosition,infrastructure,evidenceLineage}){
 if(!profile?.twinId)throw new Error('Twin profile required');
 return Object.freeze({twinId:profile.twinId,profile,currentState:Object.freeze({...currentState}),relationships:Object.freeze([...relationships]),health,marketPosition:marketPosition||null,infrastructure,evidenceLineage,projectionStatus:health?.status==='ATTENTION_REQUIRED'?'REVIEW_REQUIRED':'CURRENT',consequentialActions:'BROKER_APPROVAL_REQUIRED'});
}
