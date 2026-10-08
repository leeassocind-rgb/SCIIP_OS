import{useEffect,useMemo,useState}from'react';

const STORAGE_KEY='sciip.explorer3.workspace.v1';
const DEFAULT_STATE={mode:'analyze',selectedPropertyId:'P-IEW-201',drawerOpen:false,drawerSection:'property',presentation:false,workspaceName:'Brokerage',compareIds:[]};

function readState(){
  try{
    const saved={...DEFAULT_STATE,...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')};
    if(saved.drawerSection==='overview')saved.drawerSection='property';
    return saved;
  }catch{return DEFAULT_STATE;}
}

export function useExplorerWorkspace(){
  const[state,setState]=useState(()=>typeof localStorage==='undefined'?DEFAULT_STATE:readState());
  useEffect(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{}},[state]);
  const api=useMemo(()=>({
    setMode:mode=>setState(s=>({...s,mode,presentation:mode==='present'})),
    selectProperty:selectedPropertyId=>setState(s=>({...s,selectedPropertyId,drawerOpen:true,drawerSection:'property'})),
    openDrawer:(drawerSection='property')=>setState(s=>({...s,drawerOpen:true,drawerSection:drawerSection==='overview'?'property':drawerSection})),
    closeDrawer:()=>setState(s=>({...s,drawerOpen:false})),
    setDrawerSection:drawerSection=>setState(s=>({...s,drawerSection:drawerSection==='overview'?'property':drawerSection,drawerOpen:true})),
    toggleCompare:id=>setState(s=>({...s,compareIds:s.compareIds.includes(id)?s.compareIds.filter(x=>x!==id):[...s.compareIds,id].slice(-4)})),
    setWorkspaceName:workspaceName=>setState(s=>({...s,workspaceName})),
    reset:()=>setState(DEFAULT_STATE)
  }),[]);
  return[state,api];
}
