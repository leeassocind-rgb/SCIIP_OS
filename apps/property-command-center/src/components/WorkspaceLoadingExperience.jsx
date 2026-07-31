import React,{useEffect,useMemo,useState}from'react';
import{LoaderCircle,RefreshCw,WifiOff}from'lucide-react';
import{createWorkspaceLoadingExperience}from'../product/ux/index.js';

export default function WorkspaceLoadingExperience({workspace='Intelligence workspace',onRetry}){
 const[startedAt]=useState(()=>Date.now());
 const[tick,setTick]=useState(0);
 useEffect(()=>{const timer=setInterval(()=>setTick(value=>value+1),400);return()=>clearInterval(timer)},[]);
 const reducedMotion=typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const model=useMemo(()=>createWorkspaceLoadingExperience({
  workspace,
  elapsedMs:Date.now()-startedAt,
  online:typeof navigator==='undefined'?true:navigator.onLine,
  reducedMotion
 }),[workspace,startedAt,tick,reducedMotion]);
 return <section className={`workspace-loading-experience ${model.phase.toLowerCase()} ${model.reducedMotion?'reduced-motion':''}`} role="status" aria-live="polite" aria-busy="true">
  <div className="workspace-loading-icon">{model.online?<LoaderCircle size={24}/>:<WifiOff size={24}/>}</div>
  <div><strong>{model.message}</strong><small>Context preserved · {model.progress}% prepared</small></div>
  <div className="workspace-loading-track" aria-hidden="true"><span style={{width:`${model.progress}%`}}/></div>
  {model.retryAvailable?<button type="button" onClick={onRetry}><RefreshCw size={15}/>Retry workspace</button>:null}
 </section>
}
