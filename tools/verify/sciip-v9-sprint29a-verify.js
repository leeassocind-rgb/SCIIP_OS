"use strict";
const fs=require("fs"),path=require("path"),root=process.cwd(),out=path.join(root,"outputs/sprint29a-autonomous-market-intelligence");
const req=["governed-observation-queue.json","market-event-ledger-candidate.json","property-opportunity-rankings.json","executive-morning-briefing.json","knowledge-graph-delta-candidate.json","digital-twin-delta-candidate.json","sprint29a-certification.json"];
const failures=req.filter(f=>!fs.existsSync(path.join(out,f))).map(f=>"MISSING:"+f);let c=null;try{c=JSON.parse(fs.readFileSync(path.join(out,"sprint29a-certification.json"),"utf8"))}catch{}
if(!c||c.status!=="AUTONOMOUS_MARKET_INTELLIGENCE_CERTIFIED")failures.push("CERTIFICATION_STATUS");
if(c&&c.governance.canonicalWrites!==0)failures.push("CANONICAL_WRITES");
if(c&&c.governance.commitEnabled!==false)failures.push("COMMIT_ENABLED");
if(!fs.existsSync(path.join(root,"dist/apps-script")))failures.push("DEPLOYMENT_OUTPUT_MISSING");
const r={framework:"SCIIP_V9_SPRINT29A_AUTONOMOUS_MARKET_INTELLIGENCE_VERIFICATION",status:failures.length?"FAILED":"PASSED",checks:11,failures};console.log(JSON.stringify(r));if(failures.length)process.exit(1);
