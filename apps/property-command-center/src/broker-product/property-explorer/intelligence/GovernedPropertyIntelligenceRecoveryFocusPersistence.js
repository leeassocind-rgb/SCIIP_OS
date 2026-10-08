// SCIIP Explorer 3.0 — M2.61
const PREFIX="sciip.explorer3.m2.61.recoveryAuditFocus";
const allowed=new Set(["all","failures","retries","recoveries","authoritative"]);
export function normalizeGovernedRecoveryAuditFocus(v){v=String(v||"all").toLowerCase();return allowed.has(v)?v:"all";}
const key=id=>`${PREFIX}:${String(id||"unknown").replace(/[^a-zA-Z0-9_.:-]/g,"_")}`;
export function readGovernedRecoveryAuditFocus(id){if(typeof window==="undefined")return "all";try{return normalizeGovernedRecoveryAuditFocus(sessionStorage.getItem(key(id)));}catch{return "all";}}
export function writeGovernedRecoveryAuditFocus(id,v){v=normalizeGovernedRecoveryAuditFocus(v);if(typeof window!=="undefined")try{sessionStorage.setItem(key(id),v);}catch{}return v;}
export function buildGovernedRecoveryAuditFocusContinuity(id,focus){return Object.freeze({contract:"SCIIP_EXPLORER_3_M2_61_GOVERNED_RECOVERY_AUDIT_FOCUS_PERSISTENCE",version:"3.0-m2.61",propertyId:String(id||""),focus:normalizeGovernedRecoveryAuditFocus(focus),persistence:"SESSION_ONLY",scope:"OPERATOR_UI_ONLY",governedStateMutation:false,canonicalWrite:false,appendOnlyAuditMutation:false});}
