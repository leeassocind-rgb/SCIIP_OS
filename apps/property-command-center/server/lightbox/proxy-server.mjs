import http from'node:http';
import{URL}from'node:url';
import{getLightBoxConfig,publicLightBoxConfig}from'./config.mjs';
import{LightBoxEnrichmentService}from'./LightBoxEnrichmentService.mjs';
import{LightBoxEnrichmentOrchestrator}from'./LightBoxEnrichmentOrchestrator.mjs';

const config=getLightBoxConfig();
const service=new LightBoxEnrichmentService();
const orchestrator=new LightBoxEnrichmentOrchestrator({service});

function originAllowed(origin){
  return !origin||config.allowedOrigins.includes(origin);
}

async function readJsonBody(req){
  const chunks=[];
  for await(const chunk of req)chunks.push(chunk);
  if(!chunks.length)return{};
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return null;}
}

function send(res,status,body,origin){
  res.statusCode=status;
  res.setHeader('content-type','application/json; charset=utf-8');
  if(origin&&originAllowed(origin)){
    res.setHeader('access-control-allow-origin',origin);
    res.setHeader('access-control-allow-headers','content-type, accept');
  }
  res.setHeader('vary','Origin');
  res.end(JSON.stringify(body));
}

const server=http.createServer(async(req,res)=>{
  const origin=req.headers.origin;
  if(!originAllowed(origin))return send(res,403,{error:{code:'ORIGIN_NOT_ALLOWED'}},null);
  if(req.method==='OPTIONS'){
    res.statusCode=204;
    if(origin)res.setHeader('access-control-allow-origin',origin);
    res.setHeader('access-control-allow-methods','GET,POST,OPTIONS');
    res.setHeader('access-control-allow-headers','content-type, accept');
    res.end();return;
  }
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/health'){
    return send(res,200,{status:'OK',config:publicLightBoxConfig(config),service:service.health()},origin);
  }
  if(url.pathname==='/api/lightbox/self-test'&&req.method==='GET'){
    if(!config.enabled)return send(res,503,{status:'OFFLINE',configured:false,error:{code:'LIGHTBOX_NOT_CONFIGURED'}},origin);
    return send(res,200,{status:'READY',configured:true,canonicalAuthority:'SCIIP',parcelContract:'ACTIVE_VERIFIED',secretExposure:'SERVER_SIDE_ONLY'},origin);
  }
  if(url.pathname==='/api/lightbox/diagnostics'&&req.method==='GET'){
    return send(res,200,{
      status:'OK',
      provider:'LightBox',
      configured:config.enabled,
      canonicalAuthority:'SCIIP',
      activeContracts:orchestrator.readiness().activeContracts,
      policy:'ENRICH_NEVER_OVERWRITE_CANONICAL_IDENTITY'
    },origin);
  }
  if(url.pathname==='/api/lightbox/readiness'&&req.method==='GET'){
    return send(res,200,{status:'OK',readiness:orchestrator.readiness()},origin);
  }
  if(url.pathname==='/api/lightbox/conflicts'&&req.method==='POST'){
    const body=await readJsonBody(req);
    if(!body)return send(res,400,{error:{code:'INVALID_JSON'}},origin);
    const result=await orchestrator.enrichSelectedProperty(body.subject||{},{
      requested:['parcels']
    });
    const parcel=result.enrichments?.parcels||null;
    return send(res,200,{
      propertyId:body.subject?.id||null,
      conflictReport:parcel?.conflictReport||null
    },origin);
  }
  if(url.pathname==='/api/lightbox/enrich'&&req.method==='POST'){
    const body=await readJsonBody(req);
    if(!body)return send(res,400,{error:{code:'INVALID_JSON'}},origin);
    const subject=body.subject||{};
    if(!subject.id)return send(res,400,{error:{code:'SUBJECT_REQUIRED'}},origin);
    try{
      const result=await orchestrator.enrichSelectedProperty(subject,{
        requested:Array.isArray(body.requested)?body.requested:['parcels']
      });
      return send(res,200,result,origin);
    }catch(error){
      const code=String(error?.code||error?.name||'LIGHTBOX_ENRICH_FAILED').replace(/[^A-Z0-9_]/gi,'_').toUpperCase();
      console.error('[lightbox/enrich]',code,error?.message||String(error));
      return send(res,502,{
        error:{
          code:'LIGHTBOX_ENRICH_UPSTREAM_FAILURE',
          classification:code,
          message:'LightBox enrichment failed; see server diagnostics.'
        }
      },origin);
    }
  }
  if(url.pathname==='/api/lightbox/parcel/resolve'&&req.method==='POST'){
    const body=await readJsonBody(req);
    if(!body)return send(res,400,{error:{code:'INVALID_JSON'}},origin);
    const subject=body.subject||{};
    const lat=Number(subject.lat),lng=Number(subject.lng);
    if(!Number.isFinite(lat)||!Number.isFinite(lng)){
      return send(res,400,{error:{code:'INVALID_COORDINATES',message:'subject.lat and subject.lng are required'}},origin);
    }
    const result=await service.parcelByPoint({
      lat,lng,
      bufferDistance:Number(body.bufferDistance||100),
      bufferUnit:body.bufferUnit||'ft',
      limit:Number(body.limit||10),
      countryCode:body.countryCode||'us',
      subject
    });
    return send(res,result.status||200,result,origin);
  }
  if(url.pathname==='/api/lightbox/parcel/by-point'&&req.method==='GET'){
    const lat=Number(url.searchParams.get('lat'));
    const lng=Number(url.searchParams.get('lng'));
    if(!Number.isFinite(lat)||!Number.isFinite(lng)){
      return send(res,400,{error:{code:'INVALID_COORDINATES',message:'lat and lng are required'}},origin);
    }
    const result=await service.parcelByPoint({
      lat,lng,
      bufferDistance:Number(url.searchParams.get('bufferDistance')||100),
      bufferUnit:url.searchParams.get('bufferUnit')||'ft',
      limit:Number(url.searchParams.get('limit')||10),
      countryCode:url.searchParams.get('countryCode')||'us'
    });
    return send(res,result.status||200,result,origin);
  }
  return send(res,404,{error:{code:'NOT_FOUND'}},origin);
});

server.listen(config.port,'127.0.0.1',()=>{
  console.log(JSON.stringify({
    framework:'SCIIP_LIGHTBOX_SERVER_PROXY',
    status:'RUNNING',
    port:config.port,
    configured:config.enabled,
    allowedOrigins:config.allowedOrigins
  },null,2));
});
