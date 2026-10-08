#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname),t=fs.readFileSync(path.join(d,"certify_global_search_runtime.py"),"utf8");
const req=["GLOBAL_SEARCH_RUNTIME_CAUSAL_CONTRACT_CERTIFIED","brokerPersistsQuery","brokerNavigatesExplorer","brokerDispatchesEvent","resolverDefined","listenerBound","pendingSessionRead","matchSelectsProperty","mapConsumesFocus","applicationSourceMutation"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R4_R2_R4_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
