function sciipBuildV7Epic4PlatformCore() {
  var access=SCIIP_UNIFIED_DATA_ACCESS_LAYER.create();
  var west=SCIIP_STORAGE_PROVIDER_ABSTRACTION.memory('market-west',[{id:'P-1',city:'Rialto',sf:100000},{id:'P-2',city:'Perris',sf:200000}]);
  var east=SCIIP_STORAGE_PROVIDER_ABSTRACTION.memory('market-east',[{id:'P-2',city:'Perris',sf:200000},{id:'P-3',city:'Ontario',sf:300000}]);
  access.registerProvider(west); access.registerProvider(east);
  var repositories=SCIIP_REPOSITORY_REGISTRY.create();
  repositories.register(SCIIP_REPOSITORY_REGISTRY.inMemory('properties',[]));
  repositories.register(SCIIP_REPOSITORY_REGISTRY.inMemory('opportunities',[]));
  var tx=SCIIP_TRANSACTION_COORDINATOR.create();
  tx.run(function(){return {saved:true};},{approved:true});
  tx.run(function(){throw new Error('EXPECTED_ROLLBACK');},{});
  var planner=SCIIP_QUERY_PLANNER.create();
  var plan=planner.plan({sources:['market-west','market-east'],operation:'QUERY',criteria:{},limit:10});
  var cache=SCIIP_CACHE_MANAGER.create(); cache.put('portfolio:all',{count:3},60000); cache.get('portfolio:all');
  var federation=SCIIP_CROSS_SOURCE_FEDERATION_SERVICE.create(access,planner);
  var federated=federation.execute({sources:['market-west','market-east'],operation:'QUERY',criteria:{},dedupeKey:'id'});
  var governed=SCIIP_STORAGE_PROVIDER_ABSTRACTION.governed('governed-write',west,{reviewRequired:true});
  var approvalGate=false; try{governed.execute({operation:'APPEND',payload:{id:'P-4'},context:{}});}catch(e){approvalGate=e.message==='APPROVAL_REQUIRED';}
  var ledger=tx.ledger();
  var health=SCIIP_PLATFORM_CORE_HEALTH_CERTIFICATION.certify({providers:access.listProviders().length,repositories:repositories.count(),transactionsCommitted:ledger.filter(function(x){return x.status==='COMMITTED';}).length,transactionsRolledBack:ledger.filter(function(x){return x.status==='ROLLED_BACK';}).length,querySteps:plan.steps.length,cacheHits:cache.metrics().hits,federatedRecords:federated.records.length,approvalGateEnforced:approvalGate,northStarAligned:true});
  return {access:access,repositories:repositories,transactions:tx,plan:plan,cache:cache,federated:federated,health:health};
}
