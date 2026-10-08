// SCIIP Explorer 3.0 — M2.50 corrected
import{useEffect,useState}from'react';
import{governedPropertyIntelligenceActionEventName}from'./GovernedPropertyIntelligenceActionEvents.js';

function propertyIdOf(value){
  if(value==null)return null;
  if(typeof value==='string'||typeof value==='number')return String(value);
  return value?.propertyId||value?.id||value?.canonicalPropertyId||value?.parcelId||value?.apn||null;
}

export function useGovernedPropertyIntelligenceActionRefresh(property){
  const propertyId=propertyIdOf(property);
  const[revision,setRevision]=useState(0);
  const[lastEvent,setLastEvent]=useState(null);

  useEffect(()=>{
    if(!globalThis?.window)return;
    const eventName=governedPropertyIntelligenceActionEventName();
    const onAction=(event)=>{
      const detail=event?.detail||null;
      if(!detail||!propertyId||detail.propertyId!==propertyId)return;
      setLastEvent(detail);
      setRevision(v=>v+1);
    };
    globalThis.window.addEventListener(eventName,onAction);
    return()=>globalThis.window.removeEventListener(eventName,onAction);
  },[propertyId]);

  return{
    revision,
    lastEvent,
    propertyId,
    status:propertyId?'ACTIVE':'NO_SELECTION',
    invariants:{
      propertyScoped:true,
      eventDriven:true,
      pageReloadRequired:false,
      automaticCanonicalWrites:false
    }
  };
}
