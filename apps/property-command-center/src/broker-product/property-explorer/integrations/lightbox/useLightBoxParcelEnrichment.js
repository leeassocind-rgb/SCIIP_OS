import{useEffect,useMemo,useRef,useState}from'react';
import{lightBoxClientStatus,resolveLightBoxParcel}from'./LightBoxBrowserClient.js';

export function useLightBoxParcelEnrichment(property){
  const status=useMemo(()=>lightBoxClientStatus(),[]);
  const[state,setState]=useState({phase:status.enabled?'IDLE':'DISABLED',result:null,error:null});
  const requestRef=useRef(0);

  useEffect(()=>{
    if(!property?.id||!status.enabled){
      setState({phase:status.enabled?'IDLE':'DISABLED',result:null,error:null});
      return;
    }
    const lat=Number(property.lat),lng=Number(property.lng);
    if(!Number.isFinite(lat)||!Number.isFinite(lng)){
      setState({phase:'UNAVAILABLE',result:null,error:{code:'NO_COORDINATES'}});
      return;
    }
    const requestId=++requestRef.current;
    let active=true;
    setState({phase:'LOADING',result:null,error:null});
    resolveLightBoxParcel({
      id:property.id,address:property.address,city:property.city,zip:property.zip,
      landAcres:property.landAcres,lat,lng,parcelId:property.parcelId
    }).then(result=>{
      if(!active||requestId!==requestRef.current)return;
      if(result?.ok)setState({phase:'READY',result,error:null});
      else setState({phase:'ERROR',result:null,error:result?.error||{code:'LIGHTBOX_ERROR'}});
    }).catch(error=>{
      if(!active||requestId!==requestRef.current)return;
      setState({phase:'ERROR',result:null,error:{code:'NETWORK_ERROR',message:String(error?.message||error)}});
    });
    return()=>{active=false;};
  },[property?.id,status.enabled]);

  return{...state,clientStatus:status};
}
