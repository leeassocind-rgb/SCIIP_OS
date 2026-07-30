
import React,{useEffect,useState} from 'react';
import { loadExecutiveDashboard } from '../../../services/v5_6/IntelligenceRepository.js';
export default function Route(){
 const [data,setData]=useState(null),[error,setError]=useState(null);
 useEffect(()=>{loadExecutiveDashboard().then(setData).catch(setError)},[]);
 if(error)return <section><h2>Executive Dashboard</h2><p role="alert">{error.message}</p></section>;
 if(!data)return <section><h2>Executive Dashboard</h2><p>Loading live production intelligence…</p></section>;
 return <section><h2>Executive Dashboard</h2><pre aria-label="Executive Dashboard live data">{JSON.stringify(data,null,2)}</pre></section>;
}
