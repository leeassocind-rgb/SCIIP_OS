const plugins=new Map();
export function registerPlugin(plugin){if(!plugin?.id||!plugin?.version||typeof plugin.createClient!=='function')throw new Error('Invalid connector plugin');if(plugins.has(plugin.id))return plugins.get(plugin.id);const frozen=Object.freeze({...plugin,capabilities:Object.freeze([...(plugin.capabilities||[])])});plugins.set(plugin.id,frozen);return frozen}
export function getPlugin(id){return plugins.get(id)||null}
export function listPlugins(){return [...plugins.values()].sort((a,b)=>a.id.localeCompare(b.id))}
export function resetPluginRegistry(){plugins.clear()}
