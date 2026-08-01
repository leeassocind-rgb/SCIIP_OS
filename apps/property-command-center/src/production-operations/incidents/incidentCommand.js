const freeze=v=>Object.freeze(v);
export function createIncidentCommand({incidentId,severity='MEDIUM',commander,services=[],evidence=[]}={}){
 if(!incidentId)throw new Error('incidentId is required');
 if(!commander)throw new Error('incident commander is required');
 const status=['CRITICAL','HIGH'].includes(severity)?'ACTIVE':'MONITORING';
 return freeze({
  incidentId,severity,commander,status,
  affectedServices:freeze([...services]),
  evidence:freeze([...evidence]),
  timeline:freeze([{type:'INCIDENT_OPENED',at:new Date().toISOString()}]),
  approvalsRequired:true,
  communicationsRequired:true,
  productionWritesGoverned:true,
  autonomousExecutionAllowed:false
 });
}
