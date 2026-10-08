import React,{useEffect,useMemo,useRef,useState}from'react';
import{Command,Search,Sparkles,X}from'lucide-react';

const COMMANDS=[
  {id:'neighbors',label:'Show neighbor intelligence',hint:'Focus immediate property context',action:'neighbors'},
  {id:'market',label:'Show market spotlight',hint:'Competition, comps and market context',action:'market'},
  {id:'property',label:'Open property intelligence',hint:'Specifications, ownership and evidence',action:'property'},
  {id:'present',label:'Enter presentation mode',hint:'Client-ready map experience',action:'present'},
  {id:'analyze',label:'Return to analyze mode',hint:'Full brokerage workspace',action:'analyze'},
  {id:'compare',label:'Compare selected property',hint:'Add property to multi-select comparison',action:'compare'},
  {id:'explain',label:'Explain why this property matters',hint:'Open AI reasoning',action:'explain'}
];

export default function ExplorerCommandPalette({open,onClose,onRun,property}){
  const[query,setQuery]=useState('');
  const inputRef=useRef(null);
  useEffect(()=>{if(open){setQuery('');setTimeout(()=>inputRef.current?.focus(),0);}},[open]);
  useEffect(()=>{const fn=e=>{if(e.key==='Escape')onClose?.();};document.addEventListener('keydown',fn);return()=>document.removeEventListener('keydown',fn);},[onClose]);
  const rows=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q)return COMMANDS;
    return COMMANDS.filter(c=>`${c.label} ${c.hint}`.toLowerCase().includes(q));
  },[query]);
  if(!open)return null;
  return <div className="explorer3__palette-backdrop" onMouseDown={onClose}>
    <section className="explorer3__palette" onMouseDown={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label="SCIIP command palette">
      <header><Command size={18}/><input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Ask SCIIP about ${property?.address||'the market'}…`}/><button onClick={onClose} aria-label="Close command palette"><X size={16}/></button></header>
      <div className="explorer3__palette-suggestions"><span><Sparkles size={13}/> Suggested commands</span>{rows.map(row=><button key={row.id} onClick={()=>{onRun?.(row.action);onClose?.();}}><div><strong>{row.label}</strong><small>{row.hint}</small></div><kbd>↵</kbd></button>)}</div>
      <footer><Search size={13}/> Natural-language execution framework active · Milestone 1 uses governed command routing.</footer>
    </section>
  </div>;
}
