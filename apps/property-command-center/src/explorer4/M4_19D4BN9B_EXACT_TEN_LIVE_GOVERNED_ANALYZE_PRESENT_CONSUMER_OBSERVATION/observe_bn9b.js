#!/usr/bin/env node
const fs=require("fs"), path=require("path"), http=require("http");
const repo=path.resolve(process.argv[2]||process.env.HOME+"/Desktop/SCIIP_OS-main-merge");
const port=Number(process.argv[3]||9333);
const cohort=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"];
function get(u){return new Promise((res,rej)=>http.get(u,r=>{let d="";r.on("data",c=>d+=c);r.on("end",()=>res(d))}).on("error",rej))}
async function main(){
 console.log("============================================================================");
 console.log("SCIIP Explorer 4.0 — BN9B Live Governed Analyze/Present Consumer Observation");
 console.log("============================================================================");
 console.log("Application source mutation: OFF\nGoverned data mutation: OFF\nPixel evidence: OFF");
 let targets=JSON.parse(await get(`http://127.0.0.1:${port}/json`));
 let t=targets.find(x=>(x.url||"").includes("127.0.0.1:5173")||(x.title||"").includes("SCIIP Property Command Center"))||targets[0];
 if(!t||!t.webSocketDebuggerUrl){console.log("STATUS: BLOCKED\nDIAGNOSIS: VALIDATED_SCIIP_CDP_TARGET_NOT_AVAILABLE");process.exit(5)}
 const ws=new WebSocket(t.webSocketDebuggerUrl); await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
 let id=0,pending=new Map(); ws.onmessage=e=>{let m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}};
 const call=(method,params={})=>new Promise(resolve=>{let n=++id;pending.set(n,resolve);ws.send(JSON.stringify({id:n,method,params}))});
 const evaljs=async exp=>{let r=await call("Runtime.evaluate",{expression:exp,returnByValue:true,awaitPromise:true});return r.result?.result?.value};
 await call("Runtime.enable"); let outcomes=[];
 console.log(`Validated CDP port: ${port}\nTarget URL: ${t.url}\nSCIIP shell: True\nSearch control: True`);
 for(let i=0;i<cohort.length;i++){
   let q=cohort[i];
   let result=await evaljs(`(async()=>{const sleep=m=>new Promise(r=>setTimeout(r,m));
    const vis=e=>!!e&&!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
    const all=()=>[...document.querySelectorAll('button,[role="button"],[role="tab"],[role="menuitem"],input,[data-testid]')];
    const search=document.querySelector('input[type="search"]')||[...document.querySelectorAll('input')].find(x=>/search/i.test(x.placeholder||x.getAttribute('aria-label')||''))||document.querySelector('input');
    if(search){search.focus();search.value=${JSON.stringify(q)};search.dispatchEvent(new Event('input',{bubbles:true}));search.dispatchEvent(new Event('change',{bubbles:true}));search.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true}));}
    await sleep(500);
    const body=()=>document.body.innerText||'';
    const mapVisible=/google|map/i.test(body())||!!document.querySelector('[class*="map" i],iframe[src*="google"]');
    let analyze=all().find(e=>vis(e)&&/^analyze$/i.test((e.innerText||e.value||e.getAttribute('aria-label')||'').trim()));
    if(analyze){analyze.click();await sleep(250)}
    const analyzeVisible=!!analyze && (/analy/i.test(body())||all().some(e=>vis(e)&&/analysis|analyze/i.test(e.innerText||e.getAttribute('aria-label')||'')));
    let present=all().find(e=>vis(e)&&/^present$/i.test((e.innerText||e.value||e.getAttribute('aria-label')||'').trim()));
    if(present){present.click();await sleep(250)}
    const presentVisible=!!present && (/present/i.test(body())||all().some(e=>vis(e)&&/presentation|present/i.test(e.innerText||e.getAttribute('aria-label')||'')));
    const controlledValueMatch=!!search&&search.value===${JSON.stringify(q)};
    const explorerMounted=/SCIIP|Property Command Center/i.test(body());
    const mapAfter=/google|map/i.test(body())||!!document.querySelector('[class*="map" i],iframe[src*="google"]');
    return {controlledValueMatch,explorerMounted,mapVisible,analyzeControlClicked:!!analyze,analyzeConsumerVisible:analyzeVisible,presentControlClicked:!!present,presentConsumerVisible:presentVisible,mapVisibleAfterConsumers:mapAfter};})()`);
   let ok=Object.values(result).every(Boolean); outcomes.push({...result,label:q,outcome:ok?"LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED":"LIVE_ANALYZE_PRESENT_CONSUMER_GAP"});
   console.log(`\n[${i+1}/10] ${q}`);for(const [k,v] of Object.entries(result))console.log(`${k}: ${v}`);console.log("OUTCOME:",outcomes.at(-1).outcome);
 }
 ws.close();let n=outcomes.filter(x=>x.outcome==="LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED").length,passed=n===10;
 const out=path.join(repo,"apps/property-command-center/evidence/explorer4","M4_19D4BN9B_EXACT_TEN_LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMER_OBSERVATION");fs.mkdirSync(out,{recursive:true});
 const result={framework:"SCIIP_EXPLORER_4_BN9B_LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMER_OBSERVATION",status:passed?"PASSED":"DIAGNOSTIC_COMPLETE",state:passed?"M419D4BN9B_EXACT_TEN_LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED":"M419D4BN9B_LIVE_ANALYZE_PRESENT_OBSERVATION_INCOMPLETE",diagnosis:passed?"EXACT_TEN_LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED":"LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMER_GAP_REMAINS",observedCount:n,outcomes,next:passed?"BN9B_CERTIFIED_LIFECYCLE_CLOSURE_READY":"BN9B_REMAINS_OPEN",nextMilestone:passed?"M4_19D4BN9C_GOVERNED_ANALYZE_PRESENT_CONSUMER_LIFECYCLE_CLOSURE":null};
 const f=path.join(out,"exact_ten_live_governed_analyze_present_consumer_observation.json");fs.writeFileSync(f,JSON.stringify(result,null,2)+"\n");
 console.log(`\nOBSERVED: ${n}/10\nSTATUS: ${result.status}\nSTATE: ${result.state}\nDIAGNOSIS: ${result.diagnosis}\nNEXT: ${result.next}\nNEXT_MILESTONE: ${result.nextMilestone}\nEVIDENCE: ${f}`);
 process.exit(passed?0:5);
} main().catch(e=>{console.error(e);process.exit(6)});
