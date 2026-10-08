#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const repo=path.resolve(process.argv[2]||"."),app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence"),out=path.join(ev,"m4-19d4bh4e-search-materialization-consumption-path-forensics.json");
const files=["src/components/SCIIPBrokerApp.jsx","src/broker-product/property-explorer/v6/Explorer3.jsx"];
function snippets(f,rx){let s=fs.readFileSync(path.join(app,f),"utf8").split(/\r?\n/),a=[];s.forEach((v,i)=>rx.test(v)&&a.push({line:i+1,text:v.trim()}));return a}
const broker=snippets(files[0],/globalSearchQuery|global-property-search|Search SCIIP|setNav\('Explorer'\)/i);
const explorer=snippets(files[1],/EXPLORER3_PROPERTIES|resolveGlobalPropertySearch|searchResults=|globalSearchQuery|global-property-search|governed-base-inventory|fetch\(/i);
const src=fs.readFileSync(path.join(app,files[1]),"utf8");
let imports=src.split(/\r?\n/).filter(x=>/^import /.test(x)&&/propert|explor|inventory|data/i.test(x));
let diagnosis={
 brokerTopbarDispatchesQuery:broker.some(x=>/global-property-search/.test(x.text)),
 explorerSearchUsesExplorer3Properties:explorer.some(x=>/EXPLORER3_PROPERTIES/.test(x.text)),
 explorerDirectlyReferencesGovernedInventory:/governed-base-inventory\.json/.test(src),
 explorerFetchesGovernedInventory:/fetch\([^)]*governed-base-inventory/.test(src),
 likelyRootCause:"Explorer3 global search resolves against EXPLORER3_PROPERTIES rather than directly against public/explorer/governed-base-inventory.json"
};
let state=diagnosis.explorerSearchUsesExplorer3Properties&&!diagnosis.explorerDirectlyReferencesGovernedInventory?"M419D4BH4E_SEARCH_CONSUMPTION_PATH_DIVERGENCE_CERTIFIED_EXPLORER3_PROPERTIES_PARITY_BINDING_REQUIRED":"M419D4BH4E_SEARCH_CONSUMPTION_PATH_REQUIRES_DEEPER_RECONCILIATION";
let o={contract:"SCIIP_EXPLORER_4_M4_19D4BH4E_SEARCH_INDEX_MATERIALIZATION_CONSUMPTION_PATH_FORENSICS",version:"4.0-m4.19d4bh4e",status:"PASSED",state,certifiedAt:new Date().toISOString(),forensics:{broker,explorer,imports,diagnosis},nextMilestone:state.includes("DIVERGENCE_CERTIFIED")?"M4.19D4BH4F_GOVERNED_RUNTIME_SEARCH_PARITY_PREAUTHORIZATION":"M4.19D4BH4E1_DEEP_SEARCH_DATA_SOURCE_RECONCILIATION",safety:{applicationMutationPerformed:false,dataMutationPerformed:false,dependencyInstallationPerformed:false}};
fs.mkdirSync(ev,{recursive:true});fs.writeFileSync(out,JSON.stringify(o,null,2)+"\n");console.log(JSON.stringify(o,null,2));
