import{deepFreeze}from'./immutable.js';
export function evaluatePerformance({bundleKb=0,loadMs=0,queryMs=0}={}){const gates={bundle:bundleKb<=500,load:loadMs<=2500,query:queryMs<=500};return deepFreeze({gates,passed:Object.values(gates).every(Boolean),status:Object.values(gates).every(Boolean)?'WITHIN_BUDGET':'BUDGET_EXCEEDED'});}
