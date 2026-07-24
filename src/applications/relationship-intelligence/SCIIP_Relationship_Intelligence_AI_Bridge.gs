/** Grounded Relationship Intelligence retrieval bridge for SCIIP AI Copilot. */
function sciipRelationshipIntelligenceAnswerContext(question,dataset){
  dataset=dataset||{};var q=String(question||'').toLowerCase(),snap=SCIIP_RELATIONSHIP_INTELLIGENCE.snapshot(dataset),intent='RELATIONSHIP_SEARCH',answer=[],evidence=[];
  if(q.indexOf('broker')>=0){intent='BROKER_INTELLIGENCE';answer=snap.brokers.slice(0,10);evidence=(dataset.transactions||[]).slice(0,50);}
  else if(q.indexOf('tenant')>=0&&(q.indexOf('expand')>=0||q.indexOf('moving')>=0)){intent='TENANT_MOVEMENT';answer=snap.tenantMovements.filter(function(x){return x.type==='EXPANSION'||x.type==='RELOCATION';}).slice(0,10);evidence=(dataset.occupancies||[]).slice(0,50);}
  else if(q.indexOf('owner')>=0||q.indexOf('ownership')>=0){intent='OWNER_INTELLIGENCE';answer=snap.owners.slice(0,10);evidence=(dataset.properties||[]).slice(0,50);}
  else {answer=snap.relationships.slice(0,20);evidence=answer;}
  return{intent:intent,groundedOnly:true,answer:answer,evidence:evidence,evidenceCount:evidence.length,graphVersion:snap.schemaVersion,actions:[{type:'OPEN_WORKSPACE',workspace:'relationship-intelligence'}],governance:{reviewRequired:true,destructiveCommitEnabled:false}};
}
