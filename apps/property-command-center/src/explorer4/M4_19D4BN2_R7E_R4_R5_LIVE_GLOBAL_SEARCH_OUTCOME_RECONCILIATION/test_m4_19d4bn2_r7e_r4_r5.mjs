#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const d=path.dirname(new URL(import.meta.url).pathname),t=fs.readFileSync(path.join(d,"live_global_search_outcome.py"),"utf8");
const req=["2 Musick","13900 Carmenita Rd","BLOCKED_BROWSER_TARGET_UNAVAILABLE","REACT_SEARCH_STATE_NOT_PROVEN","MATCH_AUTO_SELECTED_OR_POST_VISIBLE","AMBIGUOUS_RENDERED","NO_MATCH_RENDERED","applicationSourceMutation","pixelEvidence"];
for(const x of req)if(!t.includes(x)){console.error("FAIL",x);process.exit(1)}
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R4_R5_STATIC_TEST",status:"PASSED",assertions:req.length},null,2));
