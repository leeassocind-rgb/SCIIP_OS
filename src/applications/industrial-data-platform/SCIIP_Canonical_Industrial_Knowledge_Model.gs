/**
 * SCIIP Epic 2 Release 4 — Canonical Industrial Knowledge Model
 * Versioned entity and relationship contracts for industrial real estate.
 */
var SCIIP_CANONICAL_INDUSTRIAL_KNOWLEDGE = (function(){
  'use strict';
  var VERSION='v7.0-epic2-release4.0';
  var SCHEMA_VERSION='industrial-knowledge-v1';
  var ENTITY_SCHEMAS={
    PROPERTY:{required:['address','city','state'],identity:['address','city','state','postalCode'],aliases:['property','site','asset'],spatial:true,search:true},
    BUILDING:{required:['propertyId'],identity:['propertyId','buildingName'],aliases:['building','facility'],spatial:true,search:true},
    INDUSTRIAL_PARK:{required:['name','city','state'],identity:['name','city','state'],aliases:['park','business park'],spatial:true,search:true},
    COMPANY:{required:['name'],identity:['normalizedName'],aliases:['company','organization'],spatial:false,search:true},
    TENANT:{required:['companyId'],identity:['companyId'],aliases:['occupant'],spatial:false,search:true},
    OWNER:{required:['companyId'],identity:['companyId'],aliases:['landlord'],spatial:false,search:true},
    BROKER:{required:['name'],identity:['email','name','companyId'],aliases:['agent'],spatial:false,search:true},
    LISTING:{required:['propertyId','status'],identity:['propertyId','listingType','sourceId'],aliases:['availability'],spatial:false,search:true},
    LEASE:{required:['propertyId','tenantId'],identity:['propertyId','tenantId','commencementDate'],aliases:['lease transaction'],spatial:false,search:true},
    SALE:{required:['propertyId','saleDate'],identity:['propertyId','saleDate','price'],aliases:['sale transaction'],spatial:false,search:true},
    DEVELOPMENT_PROJECT:{required:['name','city','state'],identity:['name','city','state'],aliases:['development','project'],spatial:true,search:true},
    MARKET:{required:['name'],identity:['name'],aliases:['region','metro'],spatial:true,search:true},
    SUBMARKET:{required:['name','marketId'],identity:['name','marketId'],aliases:['submarket'],spatial:true,search:true},
    MUNICIPALITY:{required:['name','state'],identity:['name','state'],aliases:['city'],spatial:true,search:true},
    UTILITY:{required:['name','utilityType'],identity:['name','utilityType'],aliases:['service provider'],spatial:false,search:true},
    PARCEL:{required:['apn'],identity:['apn','county'],aliases:['tax parcel','lot'],spatial:true,search:true}
  };
  var RELATIONSHIPS={
    OWNS:{from:['OWNER','COMPANY'],to:['PROPERTY','BUILDING','INDUSTRIAL_PARK','PARCEL']},
    OCCUPIES:{from:['TENANT','COMPANY'],to:['PROPERTY','BUILDING']},
    LEASES:{from:['TENANT','COMPANY'],to:['PROPERTY','BUILDING']},
    MARKETS:{from:['LISTING','BROKER'],to:['PROPERTY','BUILDING']},
    REPRESENTS:{from:['BROKER'],to:['OWNER','TENANT','COMPANY','LISTING']},
    PART_OF:{from:['BUILDING','PROPERTY','PARCEL','SUBMARKET'],to:['INDUSTRIAL_PARK','PROPERTY','MARKET','MUNICIPALITY']},
    LOCATED_IN:{from:['PROPERTY','BUILDING','INDUSTRIAL_PARK','PARCEL','DEVELOPMENT_PROJECT'],to:['SUBMARKET','MARKET','MUNICIPALITY']},
    CREATES:{from:['DEVELOPMENT_PROJECT'],to:['PROPERTY','BUILDING','INDUSTRIAL_PARK']},
    SERVED_BY:{from:['PROPERTY','BUILDING','INDUSTRIAL_PARK'],to:['UTILITY']},
    SUBJECT_OF:{from:['PROPERTY','BUILDING'],to:['LISTING','LEASE','SALE']},
    BUYER_OF:{from:['COMPANY','OWNER'],to:['SALE']},
    SELLER_OF:{from:['COMPANY','OWNER'],to:['SALE']}
  };
  function text(v){return String(v===null||v===undefined?'':v).trim();}
  function norm(v){return text(v).toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();}
  function upper(v){return text(v).toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function hash(value){var s=text(value),h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return ('00000000'+(h>>>0).toString(16)).slice(-8).toUpperCase();}
  function now(){return new Date().toISOString();}
  function schema(type){type=upper(type);return ENTITY_SCHEMAS[type]?clone(ENTITY_SCHEMAS[type]):null;}
  function canonicalize(type,data){type=upper(type);data=clone(data||{});if(data.name&&!data.normalizedName)data.normalizedName=norm(data.name);if(data.address)data.address=text(data.address).replace(/\s+/g,' ');if(data.city)data.city=text(data.city);if(data.state)data.state=upper(data.state);if(data.postalCode)data.postalCode=text(data.postalCode).replace(/[^0-9-]/g,'');if(data.apn)data.apn=upper(data.apn);return data;}
  function businessKey(type,data){type=upper(type);var s=ENTITY_SCHEMAS[type];if(!s)return null;data=canonicalize(type,data);return type+'|'+s.identity.map(function(f){return norm(data[f]);}).join('|');}
  function entityId(type,data){var key=businessKey(type,data);return key?upper(type)+'-'+hash(key):null;}
  function validateEntity(type,data){type=upper(type);var s=ENTITY_SCHEMAS[type],errors=[],warnings=[];if(!s)return {valid:false,errors:['UNKNOWN_ENTITY_TYPE'],warnings:[]};data=canonicalize(type,data);s.required.forEach(function(f){if(!text(data[f]))errors.push('REQUIRED_'+upper(f));});if((data.latitude!==undefined||data.longitude!==undefined)&&s.spatial){var lat=Number(data.latitude),lng=Number(data.longitude);if(!isFinite(lat)||lat<-90||lat>90)errors.push('INVALID_LATITUDE');if(!isFinite(lng)||lng<-180||lng>180)errors.push('INVALID_LONGITUDE');}if(!data.sourceId)warnings.push('SOURCE_ID_MISSING');return {valid:errors.length===0,errors:errors,warnings:warnings,canonicalData:data,businessKey:businessKey(type,data),entityId:entityId(type,data)};}
  function aliasSet(data){var values=[];['name','normalizedName','address','legalName','dba','sourceId'].forEach(function(k){if(data&&data[k])values.push(norm(data[k]));});(data&&data.aliases||[]).forEach(function(v){values.push(norm(v));});var seen={};return values.filter(function(v){if(!v||seen[v])return false;seen[v]=true;return true;});}
  function resolve(request){request=request||{};var type=upper(request.type),incoming=canonicalize(type,request.data||{}),key=businessKey(type,incoming),best=null;(request.candidates||[]).forEach(function(c){if(upper(c.type)!==type)return;var score=0,reasons=[];if(c.businessKey&&c.businessKey===key){score=100;reasons.push('BUSINESS_KEY_EXACT');}else{var incomingAliases=aliasSet(incoming),candidateAliases=aliasSet(c.data||c),hits=incomingAliases.filter(function(a){return candidateAliases.indexOf(a)>=0;});if(hits.length){score=Math.max(score,86);reasons.push('ALIAS_EXACT');}if(type==='PROPERTY'&&norm(incoming.address)===norm((c.data||c).address)&&norm(incoming.city)===norm((c.data||c).city)){score=Math.max(score,96);reasons.push('ADDRESS_CITY_EXACT');}if(type==='COMPANY'&&norm(incoming.name)===norm((c.data||c).name)){score=Math.max(score,94);reasons.push('COMPANY_NAME_EXACT');}}
      if(!best||score>best.score)best={candidateId:c.entityId||c.id,score:score,reasons:reasons};
    });
    var decision=!best||best.score<70?'CREATE_NEW':best.score>=90?'MATCH':'REVIEW';return {type:type,proposedEntityId:entityId(type,incoming),businessKey:key,decision:decision,confidence:best?best.score:100,match:best&&best.score?best:null,canonicalData:incoming};
  }
  function validateRelationship(r){r=r||{};var type=upper(r.type),contract=RELATIONSHIPS[type],errors=[];if(!contract)errors.push('UNKNOWN_RELATIONSHIP_TYPE');if(!r.fromId)errors.push('FROM_ID_REQUIRED');if(!r.toId)errors.push('TO_ID_REQUIRED');if(contract&&r.fromType&&contract.from.indexOf(upper(r.fromType))<0)errors.push('INVALID_FROM_TYPE');if(contract&&r.toType&&contract.to.indexOf(upper(r.toType))<0)errors.push('INVALID_TO_TYPE');return {valid:errors.length===0,errors:errors,relationshipId:type+'-'+hash([r.fromId,r.toId,type].join('|')),canonical:{type:type,fromId:r.fromId,toId:r.toId,fromType:upper(r.fromType),toType:upper(r.toType),attributes:clone(r.attributes||{})}};}
  function prepare(request){request=request||{};var timestamp=request.timestamp||now(),source=request.source||{},events=[],entities=[],relationships=[],errors=[],warnings=[];(request.entities||[]).forEach(function(e){var v=validateEntity(e.type,e.data||{});if(!v.valid){errors.push({kind:'ENTITY',type:e.type,errors:v.errors,sourceId:(e.data||{}).sourceId});return;}warnings=warnings.concat(v.warnings.map(function(w){return {entityId:v.entityId,warning:w};}));var resolution=resolve({type:e.type,data:v.canonicalData,candidates:e.candidates||[]});var id=resolution.decision==='MATCH'&&resolution.match?resolution.match.candidateId:v.entityId;var eventType=resolution.decision==='MATCH'?'ENTITY_UPDATED':'ENTITY_CREATED';var payload={entityId:id,entityType:upper(e.type),schemaVersion:SCHEMA_VERSION,businessKey:v.businessKey,data:v.canonicalData,aliases:aliasSet(v.canonicalData),provenance:{sourceId:source.sourceId||v.canonicalData.sourceId||null,sourceType:source.sourceType||null,sourceDate:source.sourceDate||null,importJobId:source.importJobId||null},resolution:resolution};entities.push(payload);events.push({eventId:'EVT-'+hash([eventType,id,timestamp,events.length].join('|')),eventType:eventType,aggregateType:'ENTITY',aggregateId:id,occurredAt:timestamp,payload:payload});});
    (request.relationships||[]).forEach(function(r){var v=validateRelationship(r);if(!v.valid){errors.push({kind:'RELATIONSHIP',type:r.type,errors:v.errors});return;}var payload={relationshipId:v.relationshipId,schemaVersion:SCHEMA_VERSION,type:v.canonical.type,fromId:v.canonical.fromId,toId:v.canonical.toId,fromType:v.canonical.fromType,toType:v.canonical.toType,attributes:v.canonical.attributes,provenance:{sourceId:source.sourceId||null,importJobId:source.importJobId||null}};relationships.push(payload);events.push({eventId:'EVT-'+hash(['RELATIONSHIP_UPSERTED',v.relationshipId,timestamp,events.length].join('|')),eventType:'RELATIONSHIP_UPSERTED',aggregateType:'RELATIONSHIP',aggregateId:v.relationshipId,occurredAt:timestamp,payload:payload});});
    var commitId='KCOM-'+hash([source.importJobId||source.sourceId||'DIRECT',timestamp,events.length].join('|'));
    return {version:VERSION,schemaVersion:SCHEMA_VERSION,status:errors.length?'INVALID':'READY_FOR_GOVERNED_COMMIT',commitId:commitId,entities:entities,relationships:relationships,events:events,errors:errors,warnings:warnings,projections:{entityCurrent:entities.length,relationshipCurrent:relationships.length,graphEdges:relationships.length,gisFeatures:entities.filter(function(e){return ENTITY_SCHEMAS[e.entityType].spatial&&e.data.latitude!==undefined&&e.data.longitude!==undefined;}).length,searchDocuments:entities.filter(function(e){return ENTITY_SCHEMAS[e.entityType].search;}).length},governance:{reviewRequired:true,approvalRequired:true,destructiveCommitEnabled:false}};
  }
  function catalog(){return {version:VERSION,schemaVersion:SCHEMA_VERSION,entityTypes:Object.keys(ENTITY_SCHEMAS),relationshipTypes:Object.keys(RELATIONSHIPS),entitySchemas:clone(ENTITY_SCHEMAS),relationshipContracts:clone(RELATIONSHIPS)};}
  return {VERSION:VERSION,SCHEMA_VERSION:SCHEMA_VERSION,catalog:catalog,schema:schema,businessKey:businessKey,entityId:entityId,validateEntity:validateEntity,resolve:resolve,validateRelationship:validateRelationship,prepare:prepare};
})();

function sciipCanonicalIndustrialKnowledgeModel(){return SCIIP_CANONICAL_INDUSTRIAL_KNOWLEDGE.catalog();}
function sciipCanonicalEntitySchema(entityType){return SCIIP_CANONICAL_INDUSTRIAL_KNOWLEDGE.schema(entityType);}
function sciipCanonicalResolveEntity(request){return SCIIP_CANONICAL_INDUSTRIAL_KNOWLEDGE.resolve(request||{});}
function sciipCanonicalPrepareKnowledgeCommit(request){return SCIIP_CANONICAL_INDUSTRIAL_KNOWLEDGE.prepare(request||{});}
