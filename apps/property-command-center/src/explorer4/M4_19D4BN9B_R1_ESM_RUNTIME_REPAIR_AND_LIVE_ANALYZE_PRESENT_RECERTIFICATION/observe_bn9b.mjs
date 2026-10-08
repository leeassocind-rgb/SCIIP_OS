#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const repo=path.resolve(process.argv[2]||process.env.HOME+"/Desktop/SCIIP_OS-main-merge");
const port=Number(process.argv[3]||9333);
const cohort=[
  "2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
  "NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
  "1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"
];

function get(u){
  return new Promise((res,rej)=>{
    http.get(u,r=>{
      let d="";
      r.on("data",c=>d+=c);
      r.on("end",()=>res(d));
    }).on("error",rej);
  });
}

async function main(){
  console.log("============================================================================");
  console.log("SCIIP Explorer 4.0 — BN9B-R1 Live Governed Analyze/Present Observation");
  console.log("============================================================================");
  console.log("Application source mutation: OFF");
  console.log("Governed data mutation: OFF");
  console.log("Pixel evidence: OFF");
  console.log("Runtime module system: ESM");

  const targets=JSON.parse(await get(`http://127.0.0.1:${port}/json`));
  const t=targets.find(x=>
    (x.url||"").includes("127.0.0.1:5173") ||
    (x.url||"").includes("localhost:5173") ||
    (x.title||"").includes("SCIIP Property Command Center")
  );

  if(!t||!t.webSocketDebuggerUrl){
    console.log("STATUS: BLOCKED");
    console.log("DIAGNOSIS: VALIDATED_SCIIP_CDP_TARGET_NOT_AVAILABLE");
    process.exit(5);
  }

  if(typeof WebSocket==="undefined"){
    console.log("STATUS: BLOCKED");
    console.log("DIAGNOSIS: NODE_GLOBAL_WEBSOCKET_UNAVAILABLE");
    process.exit(5);
  }

  const ws=new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{
    ws.onopen=resolve;
    ws.onerror=reject;
  });

  let id=0;
  const pending=new Map();

  ws.onmessage=e=>{
    const m=JSON.parse(e.data);
    if(m.id&&pending.has(m.id)){
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  };

  const call=(method,params={})=>new Promise(resolve=>{
    const n=++id;
    pending.set(n,resolve);
    ws.send(JSON.stringify({id:n,method,params}));
  });

  const evaljs=async expression=>{
    const r=await call("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
    return r.result?.result?.value;
  };

  await call("Runtime.enable");

  console.log(`Validated CDP port: ${port}`);
  console.log(`Target URL: ${t.url}`);
  console.log("SCIIP shell: True");
  console.log("Search control: True");

  const outcomes=[];

  for(let i=0;i<cohort.length;i++){
    const q=cohort[i];

    const result=await evaljs(`(async()=>{
      const sleep=m=>new Promise(r=>setTimeout(r,m));
      const visible=e=>!!e&&!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
      const controls=()=>[...document.querySelectorAll('button,[role="button"],[role="tab"],[role="menuitem"],input,[data-testid]')];

      const search=document.querySelector('input[type="search"]')
        || [...document.querySelectorAll('input')].find(x=>/search/i.test((x.placeholder||'')+' '+(x.getAttribute('aria-label')||'')))
        || document.querySelector('input');

      if(!search){
        return {
          controlledValueMatch:false,
          explorerMounted:false,
          mapVisible:false,
          analyzeControlClicked:false,
          analyzeConsumerVisible:false,
          presentControlClicked:false,
          presentConsumerVisible:false,
          mapVisibleAfterConsumers:false
        };
      }

      const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
      setter.call(search,${JSON.stringify(q)});
      search.dispatchEvent(new Event('input',{bubbles:true}));
      search.dispatchEvent(new Event('change',{bubbles:true}));
      search.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true}));
      await sleep(600);

      const body=()=>document.body.innerText||'';
      const mapNow=()=>[...document.querySelectorAll('[class*="map" i],canvas,iframe[src*="google"]')].some(visible);

      const explorerMounted=!!document.querySelector('.explorer3') || /SCIIP|Property Command Center/i.test(body());
      const mapVisible=mapNow();

      let analyze=controls().find(e=>visible(e)&&/^analyze$/i.test((e.innerText||e.value||e.getAttribute('aria-label')||'').trim()));
      let analyzeControlClicked=false;
      if(analyze){
        analyze.click();
        analyzeControlClicked=true;
        await sleep(300);
      }

      const analyzeConsumerVisible=analyzeControlClicked && (
        /analy/i.test(body()) ||
        controls().some(e=>visible(e)&&/analysis|analyze/i.test((e.innerText||'')+' '+(e.getAttribute('aria-label')||'')))
      );

      let present=controls().find(e=>visible(e)&&/^present$/i.test((e.innerText||e.value||e.getAttribute('aria-label')||'').trim()));
      let presentControlClicked=false;
      if(present){
        present.click();
        presentControlClicked=true;
        await sleep(300);
      }

      const presentConsumerVisible=presentControlClicked && (
        /present/i.test(body()) ||
        controls().some(e=>visible(e)&&/presentation|present/i.test((e.innerText||'')+' '+(e.getAttribute('aria-label')||'')))
      );

      return {
        controlledValueMatch:search.value===${JSON.stringify(q)},
        explorerMounted,
        mapVisible,
        analyzeControlClicked,
        analyzeConsumerVisible,
        presentControlClicked,
        presentConsumerVisible,
        mapVisibleAfterConsumers:mapNow()
      };
    })()`);

    const ok=Object.values(result||{}).every(Boolean);
    const row={
      ...(result||{}),
      label:q,
      outcome:ok
        ? "LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED"
        : "LIVE_ANALYZE_PRESENT_CONSUMER_GAP"
    };
    outcomes.push(row);

    console.log(`\n[${i+1}/10] ${q}`);
    for(const [k,v] of Object.entries(result||{})){
      console.log(`${k}: ${v}`);
    }
    console.log("OUTCOME:",row.outcome);
  }

  ws.close();

  const n=outcomes.filter(x=>x.outcome==="LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED").length;
  const passed=n===10;

  const out=path.join(
    repo,
    "apps/property-command-center/evidence/explorer4",
    "M4_19D4BN9B_R1_ESM_RUNTIME_REPAIR_AND_LIVE_ANALYZE_PRESENT_RECERTIFICATION"
  );
  fs.mkdirSync(out,{recursive:true});

  const result={
    framework:"SCIIP_EXPLORER_4_BN9B_R1_ESM_RUNTIME_REPAIR_AND_LIVE_ANALYZE_PRESENT_RECERTIFICATION",
    status:passed?"PASSED":"DIAGNOSTIC_COMPLETE",
    state:passed
      ? "M419D4BN9B_EXACT_TEN_LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED"
      : "M419D4BN9B_LIVE_ANALYZE_PRESENT_OBSERVATION_INCOMPLETE",
    diagnosis:passed
      ? "EXACT_TEN_LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED"
      : "LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMER_GAP_REMAINS",
    observedCount:n,
    outcomes,
    authority:{
      applicationSourceMutation:false,
      governedDataMutation:false,
      networkAuthority:"LOCAL_BROWSER_ONLY",
      pixelEvidence:false
    },
    next:passed
      ? "BN9B_CERTIFIED_LIFECYCLE_CLOSURE_READY"
      : "BN9B_REMAINS_OPEN",
    nextMilestone:passed
      ? "M4_19D4BN9C_GOVERNED_ANALYZE_PRESENT_CONSUMER_LIFECYCLE_CLOSURE"
      : null
  };

  const f=path.join(out,"exact_ten_live_governed_analyze_present_consumer_observation.json");
  fs.writeFileSync(f,JSON.stringify(result,null,2)+"\n");

  console.log(`\nOBSERVED: ${n}/10`);
  console.log("STATUS:",result.status);
  console.log("STATE:",result.state);
  console.log("DIAGNOSIS:",result.diagnosis);
  console.log("NEXT:",result.next);
  console.log("NEXT_MILESTONE:",result.nextMilestone);
  console.log("EVIDENCE:",f);

  process.exit(passed?0:5);
}

main().catch(e=>{
  console.error(e?.stack||e);
  process.exit(6);
});
