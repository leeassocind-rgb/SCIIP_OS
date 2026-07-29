const registry=new Map();
export function registerService(name,service,{replace=false}={}){if(!name||typeof name!=='string')throw new Error('Service name is required');if(!service||typeof service!=='object')throw new Error(`Service ${name} must be an object`);if(registry.has(name)&&!replace)return registry.get(name);registry.set(name,Object.freeze({...service}));return registry.get(name)}
export function resolveService(name){const service=registry.get(name);if(!service)throw new Error(`Service not registered: ${name}`);return service}
export function listServices(){return [...registry.entries()].map(([name,service])=>({name,capabilities:Object.keys(service).sort()})).sort((a,b)=>a.name.localeCompare(b.name))}
export function resetServiceRegistry(){registry.clear()}
