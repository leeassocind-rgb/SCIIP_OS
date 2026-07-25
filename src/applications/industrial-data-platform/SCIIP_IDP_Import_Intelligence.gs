/** Source recognition, mapping, normalization and validation. Pure functions are Node-testable. */
var SCIIP_IDP_IMPORT_V7 = SCIIP_IDP_IMPORT_V7 || {};
SCIIP_IDP_IMPORT_V7.norm = function(v){return String(v == null ? '' : v).trim().toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ');};
SCIIP_IDP_IMPORT_V7.recognize = function(headers){
  var h=(headers||[]).map(SCIIP_IDP_IMPORT_V7.norm), score=0, source='GENERIC_INDUSTRIAL_TABLE';
  if(h.indexOf('building sf')>=0) score+=25; if(h.indexOf('land acres')>=0) score+=20; if(h.indexOf('clear height')>=0||h.indexOf('clear ht')>=0) score+=15;
  if(h.indexOf('apn')>=0) score+=10; if(h.indexOf('address')>=0||h.indexOf('property address')>=0) score+=20; if(h.indexOf('deal type')>=0) score+=10;
  if(score>=70) source='LEE_INDUSTRIAL_SURVEY'; else if(score>=45) source='INDUSTRIAL_PROPERTY_EXPORT';
  return {sourceType:source,confidence:Math.min(99,50+score/2),signals:score};
};
SCIIP_IDP_IMPORT_V7.mapHeaders = function(headers){
  var mapping={}, unmapped=[], used={};
  (headers||[]).forEach(function(header,index){var n=SCIIP_IDP_IMPORT_V7.norm(header), match=''; Object.keys(SCIIP_IDP_V7.ALIASES).some(function(field){if(SCIIP_IDP_V7.ALIASES[field].indexOf(n)>=0){match=field;return true;}return false;}); if(match&&!used[match]){mapping[match]={sourceHeader:header,index:index};used[match]=true;}else{unmapped.push(header);}});
  return {mapping:mapping,unmapped:unmapped,mappedCount:Object.keys(mapping).length};
};
SCIIP_IDP_IMPORT_V7.number = function(v){if(v===''||v==null)return null;var n=Number(String(v).replace(/[$,%\s,]/g,''));return isFinite(n)?n:null;};
SCIIP_IDP_IMPORT_V7.normalizeRow = function(row, mapping){var out={}; Object.keys(mapping||{}).forEach(function(field){out[field]=row[mapping[field].index];}); ['buildingSf','availableSf','landAcres','clearHeight','dockHigh','gradeLevel','powerAmps','askingRate','salePrice','latitude','longitude'].forEach(function(f){if(Object.prototype.hasOwnProperty.call(out,f))out[f]=SCIIP_IDP_IMPORT_V7.number(out[f]);}); out.address=String(out.address||'').trim();out.city=String(out.city||'').trim();out.state=String(out.state||'CA').trim().toUpperCase();out.source=String(out.source||'IMPORT').trim();return out;};
SCIIP_IDP_IMPORT_V7.validate = function(record,rowNumber){var errors=[],warnings=[]; if(!record.address)errors.push('MISSING_ADDRESS'); if(!record.city)errors.push('MISSING_CITY'); if(record.latitude!=null&&(record.latitude<-90||record.latitude>90))errors.push('INVALID_LATITUDE'); if(record.longitude!=null&&(record.longitude<-180||record.longitude>180))errors.push('INVALID_LONGITUDE'); if(!record.apn)warnings.push('MISSING_APN'); if(record.latitude==null||record.longitude==null)warnings.push('MISSING_COORDINATES'); if(record.buildingSf!=null&&record.buildingSf<0)errors.push('INVALID_BUILDING_SF'); return {rowNumber:rowNumber,valid:errors.length===0,errors:errors,warnings:warnings};};
SCIIP_IDP_IMPORT_V7.businessKey = function(r){return [SCIIP_IDP_IMPORT_V7.norm(r.address),SCIIP_IDP_IMPORT_V7.norm(r.city),SCIIP_IDP_IMPORT_V7.norm(r.state),SCIIP_IDP_IMPORT_V7.norm(r.apn)].join('|');};
