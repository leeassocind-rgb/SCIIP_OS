const normalize=v=>String(v??'').trim().toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'');
export function createDecisionIdentity({assignmentId,decisionType,createdAt=''}={}){if(!assignmentId||!decisionType)throw new Error('assignmentId and decisionType are required');return `DEC-${normalize(assignmentId)}-${normalize(decisionType)}${createdAt?`-${normalize(createdAt).slice(0,16)}`:''}`;}
export function assertDecisionIdentity(id){return /^DEC-[A-Z0-9-]+$/.test(String(id||''));}
