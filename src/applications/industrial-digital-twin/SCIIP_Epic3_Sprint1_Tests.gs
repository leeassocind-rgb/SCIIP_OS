function sciipTestV7Epic3Sprint1IndustrialDigitalTwin(){
  var failures=[],tests=[];function check(name,condition){tests.push(name);if(!condition)failures.push(name);}
  var twin=sciipIndustrialDigitalTwinSample();
  check('TwinAvailable',twin.status==='AVAILABLE');
  check('CanonicalIdentity',twin.property.entityId==='PROPERTY-RIALTO-2125-LOWELL');
  check('OperationalComponents',twin.buildings.length===1&&twin.parcels.length===1&&twin.yards.length===1&&twin.utilities.length===1);
  check('Timeline',twin.timeline.length===2&&twin.timeline[0].eventType==='POWER_UPDATED');
  check('CompetitiveSet',twin.competitiveSet.length===2&&twin.competitiveSet[0].score>=twin.competitiveSet[1].score);
  check('SpatialCentroid',!!twin.spatial.centroid&&twin.spatial.centroid.latitude!==null);
  check('DataCompleteness',twin.metrics.dataCompleteness===100);
  check('GovernedReadModel',twin.version==='v7.0-epic3-sprint1.0'&&twin.schemaVersion==='industrial-digital-twin-v1');
  var out={framework:'SCIIP_V7_EPIC_3_SPRINT_1_INDUSTRIAL_DIGITAL_TWIN',version:SCIIP_INDUSTRIAL_DIGITAL_TWIN.VERSION,status:failures.length?'FAILED':'PASSED',testsRun:tests.length,failures:failures,result:{twinId:twin.twinId,propertyId:twin.property.entityId,components:{buildings:twin.buildings.length,parcels:twin.parcels.length,yards:twin.yards.length,utilities:twin.utilities.length},timelineEvents:twin.timeline.length,competitors:twin.competitiveSet.length,dataCompleteness:twin.metrics.dataCompleteness,workspace:'digital-twin'}};
  console.log(JSON.stringify(out));return out;
}
