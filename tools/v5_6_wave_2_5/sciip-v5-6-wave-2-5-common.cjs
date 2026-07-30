
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const IGNORE_DIRS = new Set(['node_modules','.git','dist','build','.sciip-backups','coverage']);

function readJson(file, fallback=null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return fallback; }
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}
function stableId(prefix, value) {
  return prefix + '-' + crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0,20).toUpperCase();
}
function now() { return new Date().toISOString(); }
function reportRoot(repo) { return path.join(repo,'reports','release-5.6','wave-2.5'); }

function walkJson(dir, out=[], depth=0) {
  if (!fs.existsSync(dir) || depth > 8) return out;
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const p = path.join(dir,entry.name);
    if (entry.isDirectory()) walkJson(p,out,depth+1);
    else if (entry.name.endsWith('.json')) out.push(p);
  }
  return out;
}
function candidateRoots(repo) {
  const roots = [
    path.join(repo,'reports'),
    path.join(repo,'data'),
    path.join(repo,'exports'),
    path.join(repo,'runtime'),
    path.join(repo,'artifacts'),
    path.join(repo,'output'),
    path.join(repo,'outputs')
  ];
  return roots.filter(fs.existsSync);
}
function discoverFiles(repo) {
  const files = [];
  for (const root of candidateRoots(repo)) {
    for (const file of walkJson(root)) {
      const rel = path.relative(repo,file);
      if (rel.includes(path.join('release-5.6','wave-2.5'))) continue;
      const data = readJson(file,null);
      if (data) files.push({path:file,relativePath:rel,data});
    }
  }
  return files;
}
function flatten(value, out=[], seen=new Set()) {
  if (value === null || value === undefined) return out;
  if (Array.isArray(value)) { for (const v of value) flatten(v,out,seen); return out; }
  if (typeof value === 'object') {
    if (seen.has(value)) return out;
    seen.add(value); out.push(value);
    for (const v of Object.values(value)) flatten(v,out,seen);
  }
  return out;
}
function norm(v) { return String(v ?? '').trim(); }
function num(v, fallback=0) {
  if (typeof v === 'string') v = v.replace(/[$,%\s,]/g,'');
  const n = Number(v); return Number.isFinite(n) ? n : fallback;
}
function first(o, keys) {
  for (const k of keys) if (o && o[k] !== undefined && o[k] !== null && norm(o[k]) !== '') return o[k];
  return null;
}
function uniqueBy(items, keyFn) {
  const m = new Map();
  for (const item of items) {
    const k = keyFn(item);
    if (k !== null && k !== undefined && k !== '') m.set(String(k),item);
  }
  return [...m.values()];
}
function classifyObjects(files) {
  const objects=[]; files.forEach(f=>flatten(f.data,objects));
  const properties=[], relationships=[], evidence=[], recommendations=[], events=[], comparables=[], gis=[];
  for (const o of objects) {
    const propertyId = first(o,['propertyId','property_id','Property_ID','buildingId','building_id','assetId','asset_id']);
    const address = first(o,['address','Address','propertyAddress','property_address','streetAddress']);
    const city = first(o,['city','City','marketCity']);
    const edgeId = first(o,['edgeId','edge_id','relationshipId','relationship_id']);
    const from = first(o,['from','sourceId','source_id','subjectId','subject_id']);
    const to = first(o,['to','targetId','target_id','objectId','object_id']);
    const evidenceId = first(o,['evidenceId','evidence_id','sourceEvidenceId','source_evidence_id']);
    const recommendationId = first(o,['recommendationId','recommendation_id']);
    const decisionId = first(o,['decisionId','decision_id']);
    const eventId = first(o,['eventId','event_id','marketEventId','market_event_id']);
    const lat = first(o,['latitude','Latitude','lat','Lat']);
    const lon = first(o,['longitude','Longitude','lng','lon','Long']);
    const transactionType = first(o,['transactionType','transaction_type','dealType','deal_type']);
    const leaseRate = first(o,['leaseRate','lease_rate','compRate','comp_rate','rate']);
    const salePrice = first(o,['salePrice','sale_price','price']);

    if (propertyId || address) properties.push({
      propertyId: propertyId || stableId('PROPERTY',[address,city]),
      address: address || null, city: city || null,
      latitude: lat !== null ? num(lat,null) : null,
      longitude: lon !== null ? num(lon,null) : null,
      buildingSf: first(o,['buildingSf','building_sf','buildingSize','building_size','Building SF','availableSf','available_sf']) || null,
      source:o
    });
    if ((edgeId || (from && to)) && from && to) relationships.push({
      edgeId: edgeId || stableId('EDGE',[from,to,first(o,['type','relationshipType','relationship_type'])]),
      from,to,type:first(o,['type','relationshipType','relationship_type']) || 'RELATED_TO',
      evidenceId:evidenceId || null, confidence:num(first(o,['confidence','confidenceScore','confidence_score']),1), source:o
    });
    if (evidenceId) evidence.push({
      evidenceId, sourceFile:first(o,['sourceFile','source_file','file','document']) || null,
      sourceType:first(o,['sourceType','source_type','type']) || null,
      confidence:num(first(o,['confidence','confidenceScore','confidence_score']),1), source:o
    });
    if (recommendationId || decisionId) recommendations.push({
      recommendationId: recommendationId || null, decisionId: decisionId || null,
      propertyId: propertyId || null, score:num(first(o,['score','priorityScore','priority_score']),0),
      evidenceId:evidenceId || null, status:first(o,['status','approvalStatus','approval_status']) || 'PENDING_REVIEW', source:o
    });
    if (eventId || first(o,['eventType','event_type','occurredAt','occurred_at','timestamp'])) events.push({
      eventId:eventId || stableId('EVENT',[propertyId,first(o,['eventType','event_type']),first(o,['date','timestamp','generatedAt'])]),
      propertyId:propertyId || null, eventType:first(o,['eventType','event_type','type']) || 'INTELLIGENCE_EVENT',
      occurredAt:first(o,['occurredAt','occurred_at','timestamp','date','generatedAt','createdAt']) || null,
      evidenceId:evidenceId || null, source:o
    });
    if (transactionType || leaseRate !== null || salePrice !== null) comparables.push({
      comparableId:first(o,['comparableId','comparable_id','compId','comp_id']) || stableId('COMP',[address,city,transactionType,leaseRate,salePrice]),
      propertyId:propertyId || null, address:address || null, city:city || null, transactionType:transactionType || null,
      leaseRate:leaseRate !== null ? num(leaseRate,null) : null, salePrice:salePrice !== null ? num(salePrice,null) : null,
      buildingSf:first(o,['buildingSf','building_sf','buildingSize','building_size','Building SF']) || null,
      occurredAt:first(o,['date','closeDate','close_date','leaseDate','lease_date']) || null, source:o
    });
    if (lat !== null && lon !== null && num(lat,999) <= 90 && num(lon,999) <= 180) gis.push({
      featureId:stableId('GIS',[propertyId,address,lat,lon]), propertyId:propertyId || null,
      latitude:num(lat),longitude:num(lon),address:address || null,city:city || null,source:o
    });
  }
  return {
    properties:uniqueBy(properties,p=>p.propertyId),
    relationships:uniqueBy(relationships,r=>r.edgeId),
    evidence:uniqueBy(evidence,e=>e.evidenceId),
    recommendations:uniqueBy(recommendations,r=>r.recommendationId||r.decisionId),
    events:uniqueBy(events,e=>e.eventId),
    comparables:uniqueBy(comparables,c=>c.comparableId),
    gis:uniqueBy(gis,g=>g.featureId),
    rawObjectCount:objects.length
  };
}
function loadRepository(repo) {
  const files=discoverFiles(repo);
  const model=classifyObjects(files);
  return {generatedAt:now(),sourceFiles:files.map(f=>f.relativePath),sourceFileCount:files.length,...model};
}
function baseReport(framework, version, result, extra={}) {
  return {framework,version,status:'PASSED',generatedAt:now(),result,...extra};
}
module.exports={readJson,writeJson,stableId,now,reportRoot,discoverFiles,flatten,norm,num,first,uniqueBy,classifyObjects,loadRepository,baseReport};
