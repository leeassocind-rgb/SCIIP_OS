import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AF_LIGHTBOX_ENRICH_HTTP_RESPONSE_FORENSICS";
export const VERSION="4.0-m4.19d4af";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function classifyText(text=""){
  const t=String(text||"").toLowerCase();
  const hits=[];
  const tests=[
    ["AUTHENTICATION_OR_AUTHORIZATION_FAILURE",/(401|403|unauthori[sz]ed|forbidden|invalid api|api.?key|credential|authentication)/],
    ["UPSTREAM_DNS_OR_CONNECTIVITY_FAILURE",/(enotfound|econnrefused|econnreset|network|dns|socket hang up|connection refused|fetch failed)/],
    ["UPSTREAM_TIMEOUT_FAILURE",/(timeout|timed out|etimedout|aborterror)/],
    ["UPSTREAM_ROUTE_OR_ENDPOINT_FAILURE",/(404|not found|route|endpoint|path)/],
    ["REQUEST_PAYLOAD_CONTRACT_FAILURE",/(400|422|invalid request|bad request|required|validation|schema|payload|subject)/],
    ["UPSTREAM_RATE_LIMIT_FAILURE",/(429|rate limit|too many requests)/],
    ["UPSTREAM_SERVER_FAILURE",/(500|502|503|504|bad gateway|service unavailable|gateway timeout|upstream failure)/]
  ];
  for(const [label,re] of tests) if(re.test(t)) hits.push(label);
  return hits;
}

export function redactDeep(value){
  if(Array.isArray(value)) return value.map(redactDeep);
  if(value && typeof value==="object"){
    const out={};
    for(const [k,v] of Object.entries(value)){
      if(/api.?key|authorization|secret|token|credential|password/i.test(k)){
        out[k]="<REDACTED>";
      }else{
        out[k]=redactDeep(v);
      }
    }
    return out;
  }
  return value;
}
