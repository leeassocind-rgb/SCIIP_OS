import fs from'node:fs';
import path from'node:path';

const METHODS=new Set(['get','post','put','patch','delete','head','options']);

function normalizeCapability(value=''){
  const s=String(value).toLowerCase();
  if(s.includes('structure'))return'structures';
  if(s.includes('assessment'))return'assessment';
  if(s.includes('true')&&s.includes('owner'))return'true-owner';
  if(s.includes('zoning'))return'zoning';
  if(s.includes('transaction'))return'transactions';
  if(s.includes('location'))return'location-info';
  if(s.includes('parcel'))return'parcels';
  if(s.includes('fema')||s.includes('wetland')||s.includes('epa')||s.includes('environment'))return'environmental';
  return'unknown';
}

export function parseOpenApiJson(filePath){
  const raw=fs.readFileSync(filePath,'utf8');
  let doc;
  try{doc=JSON.parse(raw);}catch(error){
    const wrapped=new Error(`OpenAPI intake currently requires JSON: ${error.message}`);
    wrapped.code='OPENAPI_JSON_REQUIRED';
    throw wrapped;
  }
  if(!doc||typeof doc!=='object')throw new Error('Invalid OpenAPI document');
  if(!doc.openapi&&!doc.swagger)throw new Error('Document does not declare openapi/swagger version');
  if(!doc.paths||typeof doc.paths!=='object')throw new Error('OpenAPI document contains no paths');
  return doc;
}

export function inventoryOpenApiOperations(doc,{fileName='unknown'}={}){
  const operations=[];
  for(const[pathName,pathItem]of Object.entries(doc.paths||{})){
    for(const[method,operation]of Object.entries(pathItem||{})){
      if(!METHODS.has(method.toLowerCase())||!operation||typeof operation!=='object')continue;
      const tags=Array.isArray(operation.tags)?operation.tags:[];
      const operationId=operation.operationId||null;
      const haystack=[fileName,doc.info?.title,...tags,operationId,pathName].filter(Boolean).join(' ');
      operations.push({
        method:method.toUpperCase(),
        path:pathName,
        operationId,
        tags,
        summary:operation.summary||null,
        capability:normalizeCapability(haystack)
      });
    }
  }
  return operations;
}

export function analyzeOpenApiContract(filePath){
  const doc=parseOpenApiJson(filePath);
  const fileName=path.basename(filePath);
  const operations=inventoryOpenApiOperations(doc,{fileName});
  const capabilities=[...new Set(operations.map(row=>row.capability).filter(v=>v!=='unknown'))];
  return{
    fileName,
    title:doc.info?.title||null,
    version:doc.info?.version||null,
    openapi:doc.openapi||doc.swagger||null,
    operations,
    operationCount:operations.length,
    capabilities,
    status:operations.length?'CONTRACT_IMPORTED_PENDING_REVIEW':'REJECTED_NO_OPERATIONS'
  };
}
