const freeze=v=>Object.freeze(v);
export function verifyGroundedResponse({claims=[],evidence=[]}={}){
 const ids=new Set(evidence.map(e=>e.evidenceId));const verified=claims.map(c=>{const refs=[...(c.evidenceIds||[])],supported=refs.length>0&&refs.every(id=>ids.has(id));return freeze({...c,supported,missingEvidenceIds:freeze(refs.filter(id=>!ids.has(id)))})});const unsupported=verified.filter(c=>!c.supported);
 return freeze({claims:freeze(verified),claimCount:verified.length,supportedClaims:verified.length-unsupported.length,unsupportedClaims:unsupported.length,grounded:unsupported.length===0&&verified.length>0,unsupportedClaimsAllowed:false,citationsRequired:true,productionExecutionAuthorized:false});
}
