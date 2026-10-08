import{getLightBoxConfig}from'./config.mjs';

function withTimeout(ms){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),ms);
  return{signal:controller.signal,dispose:()=>clearTimeout(timer)};
}

export class LightBoxHttpClient{
  constructor(config=getLightBoxConfig(),fetchImpl=globalThis.fetch){
    if(typeof fetchImpl!=='function')throw new Error('Fetch implementation is required');
    this.config=config;
    this.fetchImpl=fetchImpl;
  }

  async request({method='GET',path,query={}}){
    if(!this.config.enabled){
      return{ok:false,status:503,error:{code:'LIGHTBOX_NOT_CONFIGURED',message:'Server-side LIGHTBOX_API_KEY is not configured.'}};
    }
    const url=new URL(`${this.config.baseUrl}${path}`);
    for(const[key,value]of Object.entries(query||{})){
      if(value===undefined||value===null||value==='')continue;
      url.searchParams.set(key,String(value));
    }
    const timeout=withTimeout(this.config.timeoutMs);
    try{
      const response=await this.fetchImpl(url,{
        method,
        headers:{'x-api-key':this.config.apiKey,'accept':'application/json'},
        signal:timeout.signal
      });
      let body=null;
      try{body=await response.json();}catch{body={};}
      if(!response.ok){
        return{ok:false,status:response.status,error:{code:`LIGHTBOX_HTTP_${response.status}`,message:body?.error?.message||body?.message||'LightBox request failed'},body};
      }
      return{ok:true,status:response.status,data:body};
    }catch(error){
      return{ok:false,status:504,error:{code:error?.name==='AbortError'?'LIGHTBOX_TIMEOUT':'LIGHTBOX_NETWORK_ERROR',message:String(error?.message||error)}};
    }finally{
      timeout.dispose();
    }
  }
}
