/** SCIIP_OS v7 Epic 5 Build 2 — SuperSheet Property Context Engine. */
var SCIIP_PROPERTY_CONTEXT_ENGINE_V7 = SCIIP_PROPERTY_CONTEXT_ENGINE_V7 || {};
SCIIP_PROPERTY_CONTEXT_ENGINE_V7.VERSION='v7.0-epic5-build2.0';
SCIIP_PROPERTY_CONTEXT_ENGINE_V7.ALIASES={
  propertyId:['propertyid','property_id','assetid','asset_id','buildingid','building_id'],
  address:['address','propertyaddress','property_address','streetaddress','street_address'],
  city:['city','municipality'],state:['state','st'],zip:['zip','zipcode','postalcode','postal_code'],
  buildingSf:['buildingsf','building_sf','building square feet','size','squarefeet','square_feet'],
  latitude:['latitude','lat'],longitude:['longitude','lon','lng'],status:['status','availabilitystatus','availability_status'],
  tenant:['tenant','tenantname','tenant_name','occupant'],owner:['owner','ownername','owner_name'],
  sourceDate:['sourcedate','source_date','asofdate','as_of_date','date']
};
SCIIP_PROPERTY_CONTEXT_ENGINE_V7.cleanHeader=function(v){return String(v==null?'':v).trim().toLowerCase().replace(/[^a-z0-9]+/g,'');};
SCIIP_PROPERTY_CONTEXT_ENGINE_V7.cleanText=function(v){return String(v==null?'':v).trim();};
SCIIP_PROPERTY_CONTEXT_ENGINE_V7.detectSchema=function(headers){
  headers=headers||[];var normalized=headers.map(SCIIP_PROPERTY_CONTEXT_ENGINE_V7.cleanHeader),mapping={},unmapped=[];
  Object.keys(SCIIP_PROPERTY_CONTEXT_ENGINE_V7.ALIASES).forEach(function(field){
    var aliases=SCIIP_PROPERTY_CONTEXT_ENGINE_V7.ALIASES[field].map(SCIIP_PROPERTY_CONTEXT_ENGINE_V7.cleanHeader),idx=-1;
    for(var i=0;i<normalized.length;i++){if(aliases.indexOf(normalized[i])>=0){idx=i;break;}}
    if(idx>=0)mapping[field]={index:idx,header:headers[idx]};
  });
  headers.forEach(function(h,i){var used=Object.keys(mapping).some(function(k){return mapping[k].index===i;});if(!used)unmapped.push(h);});
  var required=['address','city'],missingRequired=required.filter(function(k){return !mapping[k];});
  return {status:missingRequired.length?'REVIEW_REQUIRED':'MAPPED',mapping:mapping,unmappedHeaders:unmapped,missingRequired:missingRequired,confidence:Math.round((Object.keys(mapping).length/Math.max(1,Object.keys(SCIIP_PROPERTY_CONTEXT_ENGINE_V7.ALIASES).length))*100)};
};
SCIIP_PROPERTY_CONTEXT_ENGINE_V7.value=function(row,map,field){var m=map[field];return m?row[m.index]:'';};
SCIIP_PROPERTY_CONTEXT_ENGINE_V7.slug=function(v){return SCIIP_PROPERTY_CONTEXT_ENGINE_V7.cleanText(v).toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'');};
SCIIP_PROPERTY_CONTEXT_ENGINE_V7.identity=function(record){
  var explicit=SCIIP_PROPERTY_CONTEXT_ENGINE_V7.cleanText(record.propertyId);if(explicit)return {propertyId:explicit,businessKey:'PROPERTY|'+explicit,method:'SOURCE_ID',confidence:'HIGH',reviewRequired:false};
  var parts=[record.address,record.city,record.state,record.zip].map(SCIIP_PROPERTY_CONTEXT_ENGINE_V7.slug).filter(Boolean),key='PROPERTY|'+parts.join('|');
  return {propertyId:'P-'+SCIIP_PROPERTY_CONTEXT_ENGINE_V7.slug([record.address,record.city].join('-')).slice(0,80),businessKey:key,method:'NORMALIZED_ADDRESS',confidence:record.address&&record.city?'HIGH':'LOW',reviewRequired:!(record.address&&record.city)};
};
SCIIP_PROPERTY_CONTEXT_ENGINE_V7.normalizeRow=function(row,schema,rowNumber,source){
  var m=schema.mapping,record={propertyId:this.value(row,m,'propertyId'),address:this.cleanText(this.value(row,m,'address')),city:this.cleanText(this.value(row,m,'city')),state:this.cleanText(this.value(row,m,'state')),zip:this.cleanText(this.value(row,m,'zip')),buildingSf:this.value(row,m,'buildingSf'),latitude:this.value(row,m,'latitude'),longitude:this.value(row,m,'longitude'),status:this.cleanText(this.value(row,m,'status')),tenant:this.cleanText(this.value(row,m,'tenant')),owner:this.cleanText(this.value(row,m,'owner')),sourceDate:this.value(row,m,'sourceDate')};
  var identity=this.identity(record);record.propertyId=identity.propertyId;record.businessKey=identity.businessKey;
  var errors=[];if(!record.address)errors.push('ADDRESS_REQUIRED');if(!record.city)errors.push('CITY_REQUIRED');
  return {recordId:String(source.jobId||'PREVIEW')+'|ROW|'+rowNumber,rowNumber:rowNumber,sourceName:source.sourceName||'SUPERSHEET',record:record,identity:identity,validation:{status:errors.length?'ERROR':'VALID',errors:errors},reviewStatus:errors.length||identity.reviewRequired?'HOLD':'AWAITING_REVIEW'};
};
SCIIP_PROPERTY_CONTEXT_ENGINE_V7.preview=function(values,options){
  options=options||{};values=values||[];var headers=values[0]||[],schema=this.detectSchema(headers),rows=[];
  for(var i=1;i<values.length;i++){if(values[i].some(function(v){return String(v==null?'':v).trim()!=='';}))rows.push(this.normalizeRow(values[i],schema,i+1,options));}
  var valid=rows.filter(function(r){return r.validation.status==='VALID';}).length,errors=rows.length-valid,ambiguous=rows.filter(function(r){return r.identity.reviewRequired;}).length;
  return {version:this.VERSION,status:errors||schema.missingRequired.length?'REVIEW_REQUIRED':'READY_FOR_REVIEW',sourceName:options.sourceName||'SUPERSHEET',rowCount:rows.length,schema:schema,records:rows,summary:{valid:valid,errors:errors,ambiguousIdentities:ambiguous,commitAllowed:false,reviewRequired:true},destructiveCommitEnabled:false};
};
SCIIP_PROPERTY_CONTEXT_ENGINE_V7.projections=function(preview){
  var accepted=(preview.records||[]).filter(function(r){return r.validation.status==='VALID';});
  return accepted.map(function(r){var p=r.record;return {propertyId:p.propertyId,businessKey:p.businessKey,currentState:p,event:{eventType:'SUPERSHEET_PROPERTY_STAGED',propertyId:p.propertyId,businessKey:p.businessKey,sourceName:r.sourceName,rowNumber:r.rowNumber},gis:{propertyId:p.propertyId,latitude:p.latitude,longitude:p.longitude,ready:p.latitude!==''&&p.longitude!==''},graph:{nodes:[{id:p.propertyId,type:'PROPERTY',label:p.address}],edges:[].concat(p.owner?[{from:p.propertyId,to:'ORG-'+SCIIP_PROPERTY_CONTEXT_ENGINE_V7.slug(p.owner),type:'OWNED_BY'}]:[]).concat(p.tenant?[{from:'ORG-'+SCIIP_PROPERTY_CONTEXT_ENGINE_V7.slug(p.tenant),to:p.propertyId,type:'OCCUPIES'}]:[])}};});
};
SCIIP_PROPERTY_CONTEXT_ENGINE_V7.commandRefresh=function(preview,selectedPropertyId){
  var projections=this.projections(preview),current=projections.map(function(p){return p.currentState;}),history=projections.map(function(p){return p.event;}),jobs=[{jobId:'PREVIEW',status:preview.status,rowCount:preview.rowCount,sourceName:preview.sourceName}];
  var model=SCIIP_PROPERTY_COMMAND_V7.project({selectedPropertyId:selectedPropertyId||((current[0]||{}).propertyId||''),current:current,jobs:jobs,history:history,exceptions:(preview.records||[]).filter(function(r){return r.reviewStatus==='HOLD';})});
  model.ingestion.preview=preview.summary;model.projections={properties:projections.length,gisReady:projections.filter(function(p){return p.gis.ready;}).length,graphReady:projections.length,eventsStaged:history.length};model.destructiveCommitEnabled=false;model.reviewRequired=true;return model;
};
