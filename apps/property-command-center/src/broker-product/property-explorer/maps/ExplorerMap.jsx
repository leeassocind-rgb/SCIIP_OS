import React,{useEffect,useMemo,useRef,useState}from'react';
import{MAP_PROVIDER_IDS}from'./MapProvider.js';
import{createMapProvider}from'./MapProviderRegistry.js';
import'../v5/explorer-v5.css';

export default function ExplorerMap({
  providerId=import.meta.env.VITE_MAP_PROVIDER||MAP_PROVIDER_IDS.GOOGLE,
  properties=[],selectedPropertyId,onSelectProperty,spotlightRadiusMiles=5,neighborRelationships=[],focusPropertyId=null,mapType='hybrid',focusRequestKey=0,spatialContext=null,externalParcelOverlay=null
}){
  const containerRef=useRef(null);
  const providerRef=useRef(null);
  const[status,setStatus]=useState('loading');
  const[error,setError]=useState('');
  const selected=useMemo(()=>properties.find(item=>item.id===selectedPropertyId)||properties[0]||null,[properties,selectedPropertyId]);

  useEffect(()=>{
    let disposed=false;
    const provider=createMapProvider(providerId,{
      apiKey:import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      onSelectProperty
    });
    providerRef.current=provider;
    provider.initialize(containerRef.current).then(()=>{
      if(disposed)return;
      setStatus('ready');
      provider.setProperties(properties);
      provider.setSelectedProperty(selected,{animate:false});
      provider.setSpotlight(selected,spotlightRadiusMiles);
      provider.setNeighborRelationships(selected,neighborRelationships,properties);
      provider.setMapType(mapType);
      provider.setSpatialContext?.(spatialContext||{});
      provider.setExternalParcelOverlay?.(externalParcelOverlay);
    }).catch(reason=>{
      if(disposed)return;
      setError(reason instanceof Error?reason.message:String(reason));
      setStatus('error');
    });
    return()=>{disposed=true;provider.destroy();providerRef.current=null;};
  },[providerId]);

  useEffect(()=>{if(status==='ready')providerRef.current?.setProperties(properties);},[properties,status]);
  useEffect(()=>{
    if(status!=='ready')return;
    providerRef.current?.setSelectedProperty(selected);
    providerRef.current?.setSpotlight(selected,spotlightRadiusMiles);
    providerRef.current?.setNeighborRelationships(selected,neighborRelationships,properties);
  },[selected,status,spotlightRadiusMiles,neighborRelationships,properties]);
  useEffect(()=>{if(status==='ready')providerRef.current?.setMapType(mapType);},[mapType,status]);
  useEffect(()=>{if(status==='ready')providerRef.current?.setSpatialContext?.(spatialContext||{});},[spatialContext,status]);
  useEffect(()=>{if(status==='ready')providerRef.current?.setExternalParcelOverlay?.(externalParcelOverlay);},[externalParcelOverlay,status]);
  useEffect(()=>{if(status==='ready'&&focusPropertyId)providerRef.current?.focusProperty?.(focusPropertyId,{zoom:16});},[focusPropertyId,status]);
  useEffect(()=>{if(status==='ready'&&focusRequestKey)providerRef.current?.focusSelectedProperty?.({zoom:15});},[focusRequestKey,status]);

  return <div className="explorer-v5__provider-shell">
    <div ref={containerRef} className="explorer-v5__provider-map" aria-label="SCIIP Explorer production map"/>
    {status==='loading'&&<div className="explorer-v5__map-status">Loading Google Maps…</div>}
    {status==='error'&&<div className="explorer-v5__map-status explorer-v5__map-status--error">
      <strong>Google Maps configuration required</strong>
      <span>{error}</span>
    </div>}
  </div>;
}
