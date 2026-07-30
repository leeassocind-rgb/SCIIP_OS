
import React,{useEffect,useState} from 'react';
import { loadGisLayers } from '../../../services/v5_6/IntelligenceRepository.js';
export default function Route(){
 const [data,setData]=useState(null),[error,setError]=useState(null);
 useEffect(()=>{loadGisLayers().then(setData).catch(setError)},[]);
 if(error)return <section><h2>GIS Intelligence Studio</h2><p role="alert">{error.message}</p></section>;
 if(!data)return <section><h2>GIS Intelligence Studio</h2><p>Loading live production intelligence…</p></section>;
 return <section><h2>GIS Intelligence Studio</h2><pre aria-label="GIS Intelligence Studio live data">{JSON.stringify(data,null,2)}</pre></section>;
}
