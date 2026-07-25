/** Explicit Apps Script test patch for Epic 5 Build 2. */
function sciipTestV7Epic5PropertyContextEngine(){
  var values=[['Property Address','City','State','Zip Code','Building SF','Latitude','Longitude','Owner','Tenant','Status'],['2125 W Lowell St','Rialto','CA','92377',664859,34.087,-117.389,'Brookfield','Example Tenant','AVAILABLE']];
  var preview=SCIIP_PROPERTY_CONTEXT_ENGINE_V7.preview(values,{sourceName:'REPRESENTATIVE_SUPERSHEET',jobId:'TEST-1'}),projection=SCIIP_PROPERTY_CONTEXT_ENGINE_V7.projections(preview)[0],model=SCIIP_PROPERTY_CONTEXT_ENGINE_V7.commandRefresh(preview,preview.records[0].record.propertyId);
  var tests=[
    {name:'SchemaDetected',pass:preview.schema.status==='MAPPED'&&!!preview.schema.mapping.address},
    {name:'RowValidated',pass:preview.summary.valid===1&&preview.summary.errors===0},
    {name:'IdentityResolved',pass:preview.records[0].identity.method==='NORMALIZED_ADDRESS'&&preview.records[0].identity.confidence==='HIGH'},
    {name:'EventGenerated',pass:projection.event.eventType==='SUPERSHEET_PROPERTY_STAGED'},
    {name:'GISProjected',pass:projection.gis.ready===true},
    {name:'GraphProjected',pass:projection.graph.nodes.length===1&&projection.graph.edges.length===2},
    {name:'CommandCenterRefreshed',pass:model.status==='AVAILABLE'&&model.projections.properties===1},
    {name:'GovernedReviewOnly',pass:preview.summary.commitAllowed===false&&model.reviewRequired===true&&model.destructiveCommitEnabled===false}
  ];
  var failures=tests.filter(function(t){return !t.pass;});var result={framework:'SCIIP_V7_EPIC5_PROPERTY_CONTEXT_ENGINE_BUILD2',version:SCIIP_PROPERTY_CONTEXT_ENGINE_V7.VERSION,status:failures.length?'FAILED':'PASSED',testsRun:tests.length,failures:failures,result:{source:preview.sourceName,rows:preview.rowCount,valid:preview.summary.valid,propertyId:projection.propertyId,identityMethod:preview.records[0].identity.method,events:model.projections.eventsStaged,gisReady:model.projections.gisReady,graphReady:model.projections.graphReady,workspace:model.workspace,reviewRequired:model.reviewRequired,destructiveCommitEnabled:model.destructiveCommitEnabled}};Logger.log(JSON.stringify(result));if(failures.length)throw new Error(JSON.stringify(result));return result;
}
