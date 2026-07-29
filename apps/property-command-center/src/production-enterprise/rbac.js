import{deepFreeze,required}from'./immutable.js';
export const ROLES=deepFreeze({VIEWER:['read'],ANALYST:['read','analyze'],BROKER:['read','analyze','recommend','approve'],ADMIN:['read','analyze','recommend','approve','configure','deploy','recover']});
export function authorize({role,action}){required(role,'role');required(action,'action');const allowed=ROLES[role]||[];return deepFreeze({role,action,allowed:allowed.includes(action),reason:allowed.includes(action)?'ROLE_PERMISSION_GRANTED':'ROLE_PERMISSION_DENIED'});}
export function requireAuthorization(input){const result=authorize(input);if(!result.allowed)throw new Error(result.reason);return result;}
