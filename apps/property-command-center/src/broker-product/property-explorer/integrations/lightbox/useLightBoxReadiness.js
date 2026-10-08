import{useEffect,useState}from'react';
import{fetchLightBoxReadiness,lightBoxClientStatus}from'./LightBoxBrowserClient.js';

export function useLightBoxReadiness(){
  const client=lightBoxClientStatus();
  const[state,setState]=useState({phase:client.enabled?'LOADING':'DISABLED',readiness:null});
  useEffect(()=>{
    if(!client.enabled)return;
    let active=true;
    fetchLightBoxReadiness().then(result=>{
      if(!active)return;
      setState(result?.status==='OK'?{phase:'READY',readiness:result.readiness}:{phase:'ERROR',readiness:null});
    }).catch(()=>active&&setState({phase:'ERROR',readiness:null}));
    return()=>{active=false;};
  },[client.enabled]);
  return{...state,client};
}
