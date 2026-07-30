
import React,{useEffect,useState} from 'react';
import { loadMarketIntelligence } from '../../../services/v5_6/IntelligenceRepository.js';
export default function Route(){
 const [data,setData]=useState(null),[error,setError]=useState(null);
 useEffect(()=>{loadMarketIntelligence().then(setData).catch(setError)},[]);
 if(error)return <section><h2>Market Intelligence</h2><p role="alert">{error.message}</p></section>;
 if(!data)return <section><h2>Market Intelligence</h2><p>Loading live production intelligence…</p></section>;
 return <section><h2>Market Intelligence</h2><pre aria-label="Market Intelligence live data">{JSON.stringify(data,null,2)}</pre></section>;
}
