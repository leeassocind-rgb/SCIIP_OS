const freeze=v=>Object.freeze(v);
export function protectSensitiveData({fields=[],policy={}}={}){
 const protectedFields=fields.map(f=>{const sensitive=(policy.sensitiveTypes||[]).includes(f.type);return freeze({...f,sensitive,action:sensitive?(policy.action||'REDACT'):'ALLOW',value:sensitive?'[REDACTED]':f.value})});
 return freeze({fields:freeze(protectedFields),total:protectedFields.length,protected:protectedFields.filter(f=>f.sensitive).length,policyApplied:true,rawSensitiveDataExposed:false,auditRequired:true,autonomousOverrideAllowed:false});
}
