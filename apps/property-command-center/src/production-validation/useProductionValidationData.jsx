import{useEffect,useState}from'react';

const cache=new Map();

export function useProductionValidationData(fileName){
  const cached=cache.get(fileName);
  const[state,setState]=useState({data:cached||null,error:null,loading:!cached});

  useEffect(()=>{
    let active=true;
    const existing=cache.get(fileName);
    if(existing){
      setState({data:existing,error:null,loading:false});
      return()=>{active=false};
    }

    setState({data:null,error:null,loading:true});
    fetch(`${import.meta.env.BASE_URL}production-validation-data/${fileName}`)
      .then(response=>{
        if(!response.ok)throw new Error(`Failed to load ${fileName}: HTTP ${response.status}`);
        return response.json();
      })
      .then(data=>{
        cache.set(fileName,data);
        if(active)setState({data,error:null,loading:false});
      })
      .catch(error=>{
        if(active)setState({data:null,error,loading:false});
      });

    return()=>{active=false};
  },[fileName]);

  return state;
}

export function ProductionValidationDataBoundary({fileName,children}){
  const{data,error,loading}=useProductionValidationData(fileName);
  if(loading)return <section className="workspace-panel" role="status">Loading governed production data…</section>;
  if(error)return <section className="workspace-panel" role="alert"><h1>Production data unavailable</h1><p>{error.message}</p></section>;
  return children(data);
}
