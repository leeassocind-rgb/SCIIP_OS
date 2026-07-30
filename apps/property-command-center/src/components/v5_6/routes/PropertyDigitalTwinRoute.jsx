
import React,{useEffect,useState} from 'react';
import { loadDigitalTwins } from '../../../services/v5_6/IntelligenceRepository.js';
export default function Route(){
 const [data,setData]=useState(null),[error,setError]=useState(null);
 useEffect(()=>{loadDigitalTwins().then(setData).catch(setError)},[]);
 if(error)return <section><h2>Property Digital Twins</h2><p role="alert">{error.message}</p></section>;
 if(!data)return <section><h2>Property Digital Twins</h2><p>Loading live production intelligence…</p></section>;
 return <section><h2>Property Digital Twins</h2><pre aria-label="Property Digital Twins live data">{JSON.stringify(data,null,2)}</pre></section>;
}
