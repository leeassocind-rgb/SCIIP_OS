export const VERSION="4.0-m4.19d4as1";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AS1_MARKET_AVAILABILITY_SOURCE_PRECEDENCE_RECONCILIATION";
export function kind(p=""){
 const s=p.toLowerCase();
 if(s.includes("/evidence/")) return "EVIDENCE_OR_GOVERNANCE_ARTIFACT";
 if(s.includes("/explorer4/")) return "MILESTONE_IMPLEMENTATION";
 if(/\.(jsx?|tsx?)$/.test(s)) return "APPLICATION_CODE";
 if(/fixture|demo|seed|test/.test(s)) return "FIXTURE_DEMO_OR_TEST";
 if(/governed-base-inventory\.json$/.test(s)) return "GOVERNED_BASE_INVENTORY";
 if(/data|inventory|market/.test(s)) return "DATASET_OR_MARKET_DATA";
 return "OTHER";
}
export function eligible(k){
 return ["GOVERNED_BASE_INVENTORY","DATASET_OR_MARKET_DATA"].includes(k);
}
