import{registerPlugin}from'./pluginRegistry.js';
const factory=(id,label,capabilities)=>({id,label,version:'1.0.0',capabilities,createClient:config=>({id,config,pull:async()=>({records:[],cursor:null,mode:'CONFIGURATION_REQUIRED'}),push:async()=>({status:'BROKER_APPROVAL_REQUIRED'})})});
export const BUILTIN_CONNECTORS=[factory('google-workspace','Google Workspace',['gmail','calendar','drive','contacts']),factory('microsoft-365','Microsoft 365',['outlook','teams','onedrive','sharepoint']),factory('arcgis','ArcGIS',['features','layers','geocoding']),factory('salesforce','Salesforce',['accounts','contacts','opportunities']),factory('hubspot','HubSpot',['companies','contacts','deals'])];
export function registerBuiltinConnectors(){return BUILTIN_CONNECTORS.map(registerPlugin)}
