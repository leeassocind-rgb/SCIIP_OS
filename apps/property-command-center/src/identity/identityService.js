const ROLES=Object.freeze({ADMIN:'ADMIN',PRINCIPAL:'PRINCIPAL',BROKER:'BROKER',ANALYST:'ANALYST',VIEWER:'VIEWER'});
const ROLE_ORDER=[ROLES.VIEWER,ROLES.ANALYST,ROLES.BROKER,ROLES.PRINCIPAL,ROLES.ADMIN];
export{ROLES};
export function normalizeIdentity(input={}){const role=ROLE_ORDER.includes(String(input.role||'').toUpperCase())?String(input.role).toUpperCase():ROLES.VIEWER;return Object.freeze({id:String(input.id||'anonymous'),name:String(input.name||'Anonymous User'),organizationId:String(input.organizationId||'default'),role,teamIds:[...new Set((input.teamIds||[]).map(String))].sort(),assignmentIds:[...new Set((input.assignmentIds||[]).map(String))].sort(),active:input.active!==false})}
export function identityContext(input){const identity=normalizeIdentity(input);return Object.freeze({...identity,authenticated:identity.id!=='anonymous'&&identity.active})}
export function roleAtLeast(identity,minimum){return ROLE_ORDER.indexOf(identityContext(identity).role)>=ROLE_ORDER.indexOf(minimum)}
