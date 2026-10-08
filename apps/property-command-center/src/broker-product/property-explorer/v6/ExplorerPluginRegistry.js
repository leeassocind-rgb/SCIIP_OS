const plugins=new Map();

export function registerExplorerPlugin(plugin){
  if(!plugin?.id)throw new Error('Explorer plugin id is required');
  if(plugins.has(plugin.id))return plugins.get(plugin.id);
  const normalized=Object.freeze({order:100,enabled:true,...plugin});
  plugins.set(normalized.id,normalized);
  return normalized;
}

export function getExplorerPlugins(){
  return [...plugins.values()].filter(plugin=>plugin.enabled!==false).sort((a,b)=>a.order-b.order);
}

export function getExplorerPlugin(id){return plugins.get(id)||null;}

registerExplorerPlugin({id:'property',label:'Property',order:10,capabilities:['overview','specifications','ownership']});
registerExplorerPlugin({id:'neighbors',label:'Neighbors',order:20,capabilities:['adjacency','proximity','similarity']});
registerExplorerPlugin({id:'market',label:'Market',order:30,capabilities:['competition','comparables','spotlight']});
registerExplorerPlugin({id:'assignment',label:'Assignment',order:40,capabilities:['open','match','workflow']});
registerExplorerPlugin({id:'ai',label:'AI',order:50,capabilities:['command','explain','recommend']});
