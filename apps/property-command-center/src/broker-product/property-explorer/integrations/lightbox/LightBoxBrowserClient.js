/* M4.19D4V: Browser-side VITE_LIGHTBOX_* values are CLIENT TRANSPORT CONFIG ONLY.
 * They MUST NOT be interpreted as server LightBox readiness, credentials, or authority.
 */
const baseUrl=String(import.meta.env.VITE_LIGHTBOX_PROXY_URL||'').replace(/\/+$/,'');

export function lightBoxClientStatus(){
  return Object.freeze({
    enabled:Boolean(baseUrl),
    mode:baseUrl?'SERVER_PROXY':'DISABLED',
    browserSecretPresent:Boolean(import.meta.env.VITE_LIGHTBOX_API_KEY)
  });
}

export async function fetchLightBoxParcelByPoint({lat,lng,bufferDistance=100,bufferUnit='ft',limit=10,countryCode='us'}){
  if(!baseUrl)return{ok:false,status:503,error:{code:'LIGHTBOX_PROXY_DISABLED'}};
  const url=new URL(`${baseUrl}/api/lightbox/parcel/by-point`);
  url.searchParams.set('lat',String(lat));
  url.searchParams.set('lng',String(lng));
  url.searchParams.set('bufferDistance',String(bufferDistance));
  url.searchParams.set('bufferUnit',String(bufferUnit));
  url.searchParams.set('limit',String(limit));
  url.searchParams.set('countryCode',countryCode);
  const response=await fetch(url,{headers:{accept:'application/json'}});
  return response.json();
}


export async function resolveLightBoxParcel(subject,{bufferDistance=100,bufferUnit='ft',limit=10,countryCode='us'}={}){
  if(!baseUrl)return{ok:false,status:503,error:{code:'LIGHTBOX_PROXY_DISABLED'}};
  const response=await fetch(`${baseUrl}/api/lightbox/parcel/resolve`,{
    method:'POST',
    headers:{'content-type':'application/json','accept':'application/json'},
    body:JSON.stringify({subject,bufferDistance,bufferUnit,limit,countryCode})
  });
  return response.json();
}


export async function fetchLightBoxReadiness(){
  if(!baseUrl)return{ok:false,status:503,error:{code:'LIGHTBOX_PROXY_DISABLED'}};
  const response=await fetch(`${baseUrl}/api/lightbox/readiness`,{headers:{accept:'application/json'}});
  return response.json();
}

export async function enrichWithLightBox(subject,requested=['parcels']){
  if(!baseUrl)return{ok:false,status:503,error:{code:'LIGHTBOX_PROXY_DISABLED'}};
  const response=await fetch(`${baseUrl}/api/lightbox/enrich`,{
    method:'POST',
    headers:{'content-type':'application/json','accept':'application/json'},
    body:JSON.stringify({subject,requested})
  });
  return response.json();
}


export async function lightBoxProxyHealth(){
  if(!baseUrl)return{ok:false,status:503,error:{code:'LIGHTBOX_PROXY_DISABLED'}};
  try{
    const response=await fetch(`${baseUrl}/health`,{headers:{accept:'application/json'}});
    const body=await response.json();
    return{ok:response.ok,status:response.status,...body};
  }catch(error){
    return{ok:false,status:503,error:{code:'LIGHTBOX_PROXY_UNREACHABLE',message:String(error?.message||error)}};
  }
}
