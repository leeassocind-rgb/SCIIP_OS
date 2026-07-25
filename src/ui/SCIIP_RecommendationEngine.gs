/** SCIIP_OS v7.0 Integration Sprint 3A — deterministic recommendation engine. */
var SCIIP_RECOMMENDATION_ENGINE=(function(){
  'use strict';var VERSION='v7.0-integration-sprint-3a';
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function generate(request){
    request=request||{};var intent=String(request.intent||'GENERAL').toUpperCase(),evidence=request.evidence||[],recommendations=[];
    function add(id,title,detail,workspace,priority){recommendations.push({id:id,title:title,detail:detail,workspace:workspace,priority:priority||'MEDIUM',deterministic:true});}
    if(!evidence.length){add('broaden-search','Broaden the search criteria','No grounded records matched. Remove one constraint or confirm the source registries contain the requested fields.','ai-workspace','HIGH');}
    if(intent==='SITE_SELECTION'||intent==='PROPERTY_ANALYSIS'){
      add('open-property','Review matching properties','Open Property Explorer to compare physical specifications and availability.','property-explorer','HIGH');
      add('spatial-compare','Compare spatial context','Open GIS Workspace to compare access, proximity, and market context.','gis-workspace','HIGH');
      add('relationship-review','Review ownership and relationships','Open Knowledge Graph to validate ownership, tenancy, and related entities.','knowledge-graph','MEDIUM');
    }else if(intent==='COMPANY_ANALYSIS'||intent==='TENANT_TARGETING'){
      add('graph-company','Expand company relationships','Use Knowledge Graph to inspect facilities, executives, markets, and related assets.','knowledge-graph','HIGH');
      add('map-company','Map operating footprint','Use GIS Workspace to inspect facility and market concentration.','gis-workspace','MEDIUM');
    }else if(intent==='MARKET_ANALYSIS'){
      add('market-map','Inspect market geography','Open GIS Workspace with the selected market context.','gis-workspace','HIGH');
      add('market-properties','Review market inventory','Open Property Explorer filtered to the selected market.','property-explorer','HIGH');
    }else{
      add('inspect-evidence','Inspect grounded evidence','Review the evidence cards and open the source workspace for validation.','ai-workspace','MEDIUM');
    }
    return {version:VERSION,status:'AVAILABLE',intent:intent,count:recommendations.length,recommendations:clone_(recommendations)};
  }
  return {VERSION:VERSION,generate:generate};
})();
function sciipRecommendationsV7(request){return SCIIP_RECOMMENDATION_ENGINE.generate(request||{});}
