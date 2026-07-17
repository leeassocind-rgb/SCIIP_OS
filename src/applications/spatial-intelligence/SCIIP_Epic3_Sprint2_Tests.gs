/** SCIIP v7 Epic 3 Sprint 2 certification */
function sciipTestV7Epic3Sprint2SpatialIntelligence(){
  var failures=[],w=SCIIP_SPATIAL_INTELLIGENCE.workspace();
  function ok(name,value){if(!value)failures.push(name);}
  ok('WorkspaceAvailable',w.status==='AVAILABLE');
  ok('RadiusSearch',w.radiusResults.length===3&&w.radiusResults[0].distanceMiles<=w.radiusResults[1].distanceMiles);
  ok('SuitabilityRanked',w.suitability.length===3&&w.suitability[0].score>=w.suitability[1].score);
  ok('InfluenceTiers',w.influence.some(function(x){return x.tier==='PRIMARY';})&&w.influence.some(function(x){return x.tier==='SECONDARY';}));
  ok('LayerCatalog',w.layers.length>=10&&w.layers.some(function(x){return x.id==='power';}));
  ok('Requirements',w.requirements.minimumPowerAmps===4000);
  ok('Distances',w.radiusResults.every(function(x){return typeof x.distanceMiles==='number';}));
  ok('PublicApi',typeof sciipSpatialSuitabilityRank==='function');
  var out={framework:'SCIIP_V7_EPIC_3_SPRINT_2_SPATIAL_INTELLIGENCE',version:'v7.0-epic3-sprint2.0',status:failures.length?'FAILED':'PASSED',testsRun:8,failures:failures,result:{radiusResults:w.radiusResults.length,suitabilityResults:w.suitability.length,primaryCompetitors:w.influence.filter(function(x){return x.tier==='PRIMARY';}).length,secondaryCompetitors:w.influence.filter(function(x){return x.tier==='SECONDARY';}).length,layers:w.layers.length,topProperty:w.suitability[0].propertyId,topScore:w.suitability[0].score,workspace:'spatial-intelligence'}};
  console.log(JSON.stringify(out));return out;
}
