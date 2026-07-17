function sciipTestV7Epic3Sprint7(){
  var input={entities:[
    {id:'P-LOWELL',type:'PROPERTY',name:'2125 W Lowell St',businessKey:'PROPERTY|2125-W-LOWELL-ST-RIALTO',latitude:34.087,longitude:-117.389,attributes:{market:'Inland Empire West',powerAmps:8000},evidence:[{sourceId:'SUPERSHEET-1',sourceType:'SUPERSHEET',confidence:95}]},
    {id:'OWNER-A',type:'COMPANY',name:'Owner A',attributes:{industry:'Industrial Real Estate'}},
    {id:'TENANT-AERO',type:'COMPANY',name:'Aerospace Tenant',attributes:{industry:'Aerospace Manufacturing'}},
    {id:'UTILITY-SCE',type:'UTILITY',name:'Southern California Edison',latitude:34.08,longitude:-117.40},
    {id:'MARKET-IEW',type:'MARKET',name:'Inland Empire West',latitude:34.05,longitude:-117.45},
    {id:'P-LOWELL-DUP',type:'PROPERTY',name:'Lowell Logistics',businessKey:'PROPERTY|2125-W-LOWELL-ST-RIALTO',aliases:['Locust Gateway Logistics Center']}
  ],relationships:[
    {id:'R1',sourceId:'OWNER-A',targetId:'P-LOWELL',type:'OWNS',confidence:98,evidence:[{sourceId:'TITLE-1',sourceType:'PUBLIC_RECORD',confidence:98}]},
    {id:'R2',sourceId:'TENANT-AERO',targetId:'P-LOWELL',type:'OCCUPIES',confidence:85,evidence:[{sourceId:'LEASE-1',sourceType:'LEASE',confidence:85}]},
    {id:'R3',sourceId:'P-LOWELL',targetId:'UTILITY-SCE',type:'SERVED_BY',confidence:90,evidence:[{sourceId:'UTILITY-1',sourceType:'UTILITY_RECORD',confidence:90}]},
    {id:'R4',sourceId:'P-LOWELL',targetId:'MARKET-IEW',type:'LOCATED_IN',confidence:100,evidence:[{sourceId:'GIS-1',sourceType:'GIS',confidence:100}]},
    {id:'R5',sourceId:'MISSING',targetId:'P-LOWELL',type:'RELATED_TO',confidence:40}
  ]};
  var graph=SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.build(input);
  var query=SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.query(input,{entityType:'COMPANY',industry:'Aerospace',minimumConfidence:80});
  var path=SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.shortestPath(input,'OWNER-A','UTILITY-SCE',{maxDepth:4});
  var spatial=SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.spatialProjection(input);
  var context=SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.evidenceContext(input,['P-LOWELL'],{limit:10});
  var application=SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH_APPLICATION.run(input);
  var persistence=SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH_PERSISTENCE.persist(application.result,{commit:false,asOfDate:'2026-07-17'});
  var failures=[];
  if(graph.entities.length!==5) failures.push('Canonical duplicate resolution failed.');
  if(graph.relationships.length!==4||graph.rejectedRelationships!==1) failures.push('Relationship governance failed.');
  if(query.entities.length!==1||query.entities[0].id!=='TENANT-AERO') failures.push('Cross-domain query failed.');
  if(!path.found||path.depth!==2) failures.push('Shortest-path traversal failed.');
  if(spatial.pointCount!==3||spatial.linkCount!==2) failures.push('GIS graph projection failed.');
  if(context.groundedCount!==4) failures.push('Evidence context failed.');
  if(application.descriptor.northStar.advances.indexOf('CONNECTS_KNOWLEDGE')===-1) failures.push('North Star declaration missing.');
  if(persistence.status!=='PREVIEW'||persistence.destructiveWrite!==false) failures.push('Persistence governance failed.');
  return {framework:'SCIIP_V7_EPIC_3_SPRINT_7_ENTERPRISE_RELATIONSHIP_GRAPH',version:'v7.0-epic3-sprint7.0',status:failures.length?'FAILED':'PASSED',testsRun:8,failures:failures,result:{canonicalEntities:graph.entities.length,relationships:graph.relationships.length,rejectedRelationships:graph.rejectedRelationships,aerospaceMatches:query.entities.length,shortestPathDepth:path.depth,spatialPoints:spatial.pointCount,spatialLinks:spatial.linkCount,groundedContext:context.groundedCount,workspace:application.descriptor.workspace,reviewRequired:application.descriptor.governance.reviewRequired,destructiveCommitEnabled:application.descriptor.governance.destructiveCommitEnabled}};
}
