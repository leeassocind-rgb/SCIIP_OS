import{useEffect,useState}from'react';
import{lightBoxProxyHealth}from'./LightBoxBrowserClient.js';

export function useLightBoxProxyHealth(){
  const[state,setState]=useState({phase:'CHECKING',health:null,error:null});
  useEffect(()=>{
    let active=true;
    let timer=null;
    const run=async()=>{
      try{
        const result=await lightBoxProxyHealth();
        if(!active)return;
        if(result?.ok||result?.status==='OK')setState({phase:'READY',health:result,error:null});
        else setState({phase:'OFFLINE',health:null,error:result?.error||{code:'LIGHTBOX_PROXY_OFFLINE'}});
      }catch(error){
        if(active)setState({phase:'OFFLINE',health:null,error:{code:'LIGHTBOX_PROXY_OFFLINE',message:String(error?.message||error)}});
      }
      if(active)timer=setTimeout(run,30000);
    };
    run();
    return()=>{active=false;if(timer)clearTimeout(timer);};
  },[]);
  return state;
}
