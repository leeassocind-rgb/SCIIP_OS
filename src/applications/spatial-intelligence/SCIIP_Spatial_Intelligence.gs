/** SCIIP v7 Epic 3 Sprint 2 — Spatial Intelligence */
var SCIIP_SPATIAL_INTELLIGENCE = (function(){
  'use strict';
  var VERSION='v7.0-epic3-sprint2.0';
  function n(v){var x=Number(v);return isFinite(x)?x:null;}
  function txt(v){return String(v==null?'':v).trim();}
  function clone(v){return JSON.parse(JSON.stringify(v||{}));}
  function miles(a,b){if(!a||!b)return null;var a1=n(a.latitude),o1=n(a.longitude),a2=n(b.latitude),o2=n(b.longitude);if([a1,o1,a2,o2].some(function(x){return x===null;}))return null;var p=Math.PI/180,r=3958.7613,d1=(a2-a1)*p,d2=(o2-o1)*p,q=Math.sin(d1/2)*Math.sin(d1/2)+Math.cos(a1*p)*Math.cos(a2*p)*Math.sin(d2/2)*Math.sin(d2/2);return Math.round(2*r*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))*100)/100;}
  function radiusSearch(origin,properties,radius){radius=n(radius)||10;return (properties||[]).map(function(p){var d=miles(origin,p);var q=clone(p);q.distanceMiles=d;return q;}).filter(function(p){return p.distanceMiles!==null&&p.distanceMiles<=radius;}).sort(function(a,b){return a.distanceMiles-b.distanceMiles;});}
  function score(property,requirements){requirements=requirements||{};var dims=[],total=0,weights=0;function min(field,reqField,w){var req=n(requirements[reqField]),actual=n(property[field]);if(req===null)return;var s=actual===null?0:Math.min(1,actual/Math.max(req,1));dims.push({dimension:reqField,actual:actual,required:req,score:Math.round(s*100),weight:w});total+=s*w;weights+=w;}function max(field,reqField,w){var req=n(requirements[reqField]),actual=n(property[field]);if(req===null)return;var s=actual===null?0:(actual<=req?1:Math.max(0,1-(actual-req)/Math.max(req,1)));dims.push({dimension:reqField,actual:actual,required:req,score:Math.round(s*100),weight:w});total+=s*w;weights+=w;}min('buildingSf','minimumBuildingSf',25);min('clearHeightFt','minimumClearHeightFt',15);min('powerAmps','minimumPowerAmps',20);min('trailerParking','minimumTrailerParking',10);min('dockHighDoors','minimumDockHighDoors',10);max('distanceMiles','maximumDistanceMiles',20);return {propertyId:property.entityId||property.propertyId||'',name:property.name||property.address||'',score:weights?Math.round(total/weights*100):0,qualified:dims.every(function(d){return d.score>=100;}),dimensions:dims};}
  function rank(origin,properties,requirements){requirements=clone(requirements||{});return radiusSearch(origin,properties,requirements.maximumDistanceMiles||50).map(function(p){var result=score(p,requirements);result.distanceMiles=p.distanceMiles;result.property=p;return result;}).sort(function(a,b){return b.score-a.score||a.distanceMiles-b.distanceMiles;});}
  function influence(subject,properties,options){options=options||{};var primary=n(options.primaryRadiusMiles)||10,secondary=n(options.secondaryRadiusMiles)||25;return (properties||[]).map(function(p){var d=miles(subject,p),tier=d===null?'UNRESOLVED':d<=primary?'PRIMARY':d<=secondary?'SECONDARY':'OUTSIDE';return {propertyId:p.entityId||p.propertyId,name:p.name||p.address,distanceMiles:d,tier:tier};}).sort(function(a,b){return (a.distanceMiles==null?99999:a.distanceMiles)-(b.distanceMiles==null?99999:b.distanceMiles);});}
  function layers(input){input=input||{};var catalog=[
    {id:'properties',label:'Industrial Properties',category:'CORE',enabled:true},
    {id:'competition',label:'Competitive Set',category:'MARKET',enabled:true},
    {id:'power',label:'Power Infrastructure',category:'INFRASTRUCTURE',enabled:false},
    {id:'utilities',label:'Utility Territories',category:'INFRASTRUCTURE',enabled:false},
    {id:'rail',label:'Rail Access',category:'TRANSPORTATION',enabled:false},
    {id:'ports',label:'Ports',category:'TRANSPORTATION',enabled:false},
    {id:'airports',label:'Airports',category:'TRANSPORTATION',enabled:false},
    {id:'labor',label:'Labor Markets',category:'DEMOGRAPHICS',enabled:false},
    {id:'flood',label:'Flood Hazard',category:'RISK',enabled:false},
    {id:'seismic',label:'Seismic Hazard',category:'RISK',enabled:false},
    {id:'zoning',label:'Industrial Zoning',category:'LAND_USE',enabled:false}
  ];var enabled=input.enabled||[];catalog.forEach(function(l){if(enabled.indexOf(l.id)>=0)l.enabled=true;});return catalog;}
  function workspace(){var subject={entityId:'PROPERTY-RIALTO-2125-LOWELL',name:'Locust Gateway Logistics Center',address:'2125 W Lowell St',city:'Rialto',latitude:34.0978,longitude:-117.4147,buildingSf:664859,clearHeightFt:42,powerAmps:8000,trailerParking:398,dockHighDoors:82};var candidates=[{entityId:'PROPERTY-SLOVER',name:'Slover Logistics Center',city:'Bloomington',latitude:34.062,longitude:-117.407,buildingSf:650000,clearHeightFt:40,powerAmps:4000,trailerParking:350,dockHighDoors:78},{entityId:'PROPERTY-HARVILL',name:'20123 Harvill Ave',city:'Perris',latitude:33.843,longitude:-117.258,buildingSf:500000,clearHeightFt:40,powerAmps:4000,trailerParking:250,dockHighDoors:60},{entityId:'PROPERTY-NORTH-RIALTO',name:'North Rialto Distribution Center',city:'Rialto',latitude:34.135,longitude:-117.38,buildingSf:700000,clearHeightFt:42,powerAmps:6000,trailerParking:360,dockHighDoors:86}];var req={minimumBuildingSf:500000,minimumClearHeightFt:40,minimumPowerAmps:4000,minimumTrailerParking:200,minimumDockHighDoors:50,maximumDistanceMiles:30};return {version:VERSION,status:'AVAILABLE',subject:subject,requirements:req,radiusResults:radiusSearch(subject,candidates,30),suitability:rank(subject,candidates,req),influence:influence(subject,candidates,{primaryRadiusMiles:10,secondaryRadiusMiles:30}),layers:layers({enabled:['power','ports']}),generatedAt:new Date().toISOString()};}
  return {VERSION:VERSION,distanceMiles:miles,radiusSearch:radiusSearch,scoreSuitability:score,rankSuitability:rank,competitiveInfluence:influence,layerCatalog:layers,workspace:workspace};
})();
function sciipSpatialRadiusSearch(origin,properties,radiusMiles){return SCIIP_SPATIAL_INTELLIGENCE.radiusSearch(origin,properties,radiusMiles);}
function sciipSpatialSuitabilityRank(origin,properties,requirements){return SCIIP_SPATIAL_INTELLIGENCE.rankSuitability(origin,properties,requirements);}
function sciipSpatialCompetitiveInfluence(subject,properties,options){return SCIIP_SPATIAL_INTELLIGENCE.competitiveInfluence(subject,properties,options);}
function sciipSpatialIntelligenceWorkspace(){return SCIIP_SPATIAL_INTELLIGENCE.workspace();}
