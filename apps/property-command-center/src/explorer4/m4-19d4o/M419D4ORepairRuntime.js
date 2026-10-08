export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4O_LIGHTBOX_ENRICH_ERROR_BOUNDARY_REPAIR_AND_ISOLATED_VALIDATION";
export const VERSION="4.0-m4.19d4o";

export function patchedRoute(original=""){
  const needle = `  if(url.pathname==='/api/lightbox/enrich'&&req.method==='POST'){
    const body=await readJsonBody(req);
    if(!body)return send(res,400,{error:{code:'INVALID_JSON'}},origin);
    const subject=body.subject||{};
    if(!subject.id)return send(res,400,{error:{code:'SUBJECT_REQUIRED'}},origin);
    const result=await orchestrator.enrichSelectedProperty(subject,{
      requested:Array.isArray(body.requested)?body.requested:['parcels']
    });
    return send(res,200,result,origin);
  }`;

  const replacement = `  if(url.pathname==='/api/lightbox/enrich'&&req.method==='POST'){
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
  }`;

  if(!original.includes(needle)) return {ok:false,reason:"EXACT_ROUTE_BLOCK_NOT_FOUND",text:original};
  return {ok:true,text:original.replace(needle,replacement),replacement};
}
