
import React,{useEffect,useState} from 'react';
import { loadKnowledgeGraph } from '../../../services/v5_6/IntelligenceRepository.js';
export default function Route(){
 const [data,setData]=useState(null),[error,setError]=useState(null);
 useEffect(()=>{loadKnowledgeGraph().then(setData).catch(setError)},[]);
 if(error)return <section><h2>Knowledge Graph</h2><p role="alert">{error.message}</p></section>;
 if(!data)return <section><h2>Knowledge Graph</h2><p>Loading live production intelligence…</p></section>;
 return <section><h2>Knowledge Graph</h2><pre aria-label="Knowledge Graph live data">{JSON.stringify(data,null,2)}</pre></section>;
}
