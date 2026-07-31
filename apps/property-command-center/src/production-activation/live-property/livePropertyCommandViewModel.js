const freeze=v=>Object.freeze(v);

export function createLivePropertyCommandViewModel({activation={},graphSnapshot={},ledger=[]}={}){
 const nodes=Array.isArray(graphSnapshot?.nodes)?graphSnapshot.nodes:[];
 const properties=nodes.filter(node=>String(node.type||node.kind||'').toUpperCase().includes('PROPERTY'));
 const ingestion=activation.ingestion||{};
 const latest=ingestion.latest||{};
 const blockers=[];
 if(!ingestion.totalRuns)blockers.push('NO_LIVE_INGESTION');
 if(latest.error)blockers.push('INGESTION_ERROR');
 if(Number(latest.rejected||0)>0)blockers.push('REJECTED_ROWS_PRESENT');
 if(!properties.length)blockers.push('NO_PROPERTY_GRAPH_RECORDS');

 return freeze({
  health:blockers.length?'ATTENTION_REQUIRED':'OPERATIONAL',
  blockers:freeze(blockers),
  ingestion:freeze({...ingestion}),
  propertyCount:properties.length,
  properties:freeze(properties.slice(0,50).map(item=>freeze({...item}))),
  ledgerCount:Array.isArray(ledger)?ledger.length:0,
  latestFile:latest.fileName||null,
  accepted:Number(latest.accepted||0),
  warnings:Number(latest.warnings||0),
  rejected:Number(latest.rejected||0),
  graphConnected:true,
  activationRuntimeConnected:true,
  searchReady:properties.length>0,
  copilotEvidenceReady:properties.length>0,
  gisReady:properties.some(item=>item.latitude||item.longitude||item.coordinates),
  productionExecutionAuthorized:false
 });
}
