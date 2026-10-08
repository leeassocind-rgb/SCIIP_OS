#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,time,urllib.request,itertools
PRIOR="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_COMPARATOR_REPAIR_SYNTAX_ONLY_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R1_POST_SYNTAX_REPAIR_EXPLORER_SETTLE_RESIDUAL_CAUSAL_DIAGNOSIS"
APP="http://127.0.0.1:5173"
def main():
 repo=Path(sys.argv[1]).expanduser().resolve();er=repo/"apps/property-command-center/evidence/explorer4"
 prior=er/PRIOR/"comparator_repair_syntax_only_repair_and_candidate_selection_recertification.json"
 out=er/OUT;out.mkdir(parents=True,exist_ok=True);ep=out/"post_syntax_repair_explorer_settle_residual_causal_diagnosis.json"
 print("="*120);print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R1 Post-Syntax-Repair Explorer Settle Residual Causal Diagnosis");print("="*120)
 print("Mode: READ_ONLY_FRESH_PAGE_EXPLORER_SETTLE_DIAGNOSIS");print("Application source mutation: OFF");print("Governed data mutation: OFF");print("Explorer click: OFF");print("Property click: OFF");print("Assignments invocation: OFF");print("Generate invocation: OFF");print("Export invocation: OFF")
 pj=json.loads(prior.read_text()) if prior.exists() else {}
 if pj.get("status")!="DIAGNOSTIC_COMPLETE": print("STATUS: BLOCKED\nREASON: prior evidence missing/unexpected");return 4
 try:
  import websocket
  tabs=json.loads(urllib.request.urlopen("http://127.0.0.1:9333/json",timeout=2).read())
 except Exception as e: print("STATUS: BLOCKED\nREASON: CDP unavailable or websocket-client unavailable:",e);return 5
 pages=[x for x in tabs if x.get("type")=="page"];target=next((x for x in pages if str(x.get("url","")).startswith(APP)),pages[0] if pages else None)
 if not target: print("STATUS: BLOCKED\nREASON: no CDP page target");return 6
 ws=websocket.create_connection(target["webSocketDebuggerUrl"],timeout=3);seq=itertools.count(1)
 def call(method,params=None):
  i=next(seq);ws.send(json.dumps({"id":i,"method":method,"params":params or {}}))
  while True:
   m=json.loads(ws.recv())
   if m.get("id")==i:return m
 call("Page.enable");call("Runtime.enable");call("Page.navigate",{"url":APP+"/"})
 expr="""(()=>{const vis=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0&&!e.disabled};const bs=[...document.querySelectorAll('button')];const ex=bs.filter(b=>(b.innerText||b.textContent||'').trim()==='Explorer');return {readyState:document.readyState,origin:location.origin,url:location.href,bodyLength:(document.body?.innerText||'').length,buttonCount:bs.length,exactExplorerCount:ex.length,visibleEnabledExplorerCount:ex.filter(vis).length,assignmentsCount:bs.filter(b=>(b.innerText||b.textContent||'').trim()==='Assignments').length}})()"""
 schedule=[0,.05,.1,.15,.2,.25,.35,.5,.75,1,1.25,1.5,1.75,2,2.5,3,4,5];samples=[];start=time.monotonic()
 for t in schedule:
  q=start+t-time.monotonic()
  if q>0:time.sleep(q)
  m=call("Runtime.evaluate",{"expression":expr,"returnByValue":True});v=m.get("result",{}).get("result",{}).get("value",{}) or {};v["t"]=t;samples.append(v)
 ws.close()
 valid=[s for s in samples if s.get("readyState")=="complete" and s.get("origin")==APP and s.get("buttonCount",0)>0 and s.get("visibleEnabledExplorerCount")==1]
 first=min((s["t"] for s in valid),default=None);a2=[s for s in valid if s["t"]>=2];stable=len(a2)>=3 and all(s.get("visibleEnabledExplorerCount")==1 for s in a2[-3:])
 classification="EXPLORER_CONTROL_STABLY_MATERIALIZES_WITHIN_TWO_SECONDS_POST_SYNTAX_FAILURE_IS_TRANSIENT_FRESH_PAGE_RACE" if first is not None and first<=2 and stable else "EXPLORER_CONTROL_POST_SYNTAX_SETTLE_FAILURE_REPRODUCED_OR_TIMING_BOUNDARY_EXCEEDED"
 checks={"priorDiagnosticConsumed":True,"cdpAvailable":True,"freshNavigationPerformed":True,"boundedFiveSecondObservationUsed":True,"firstUniqueExplorerResolved":first is not None,"uniqueExplorerWithinTwoSeconds":first is not None and first<=2,"stableAtOrAfterTwoSeconds":stable,"noExplorerClickPerformed":True,"noPropertyClickPerformed":True,"assignmentsInvocationOff":True,"generateInvocationOff":True,"exportInvocationOff":True,"applicationMutationOff":True,"governedMutationOff":True}
 print("FIRST_UNIQUE_EXPLORER_SECONDS:",first);print("STABLE_AT_OR_AFTER_2S:",stable);print("----- TIMING SAMPLES -----")
 for s in samples:print(json.dumps(s,sort_keys=True))
 nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R2_EXPLORER_SETTLE_FRESH_PAGE_RETRY_HARDENING_AND_CANDIDATE_SELECTION_RECERTIFICATION"
 ev={"framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R1_POST_SYNTAX_REPAIR_EXPLORER_SETTLE_RESIDUAL_CAUSAL_DIAGNOSIS","generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED","state":"M419D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R1_POST_SYNTAX_REPAIR_EXPLORER_SETTLE_RESIDUAL_CAUSE_DIAGNOSED","classification":classification,"samples":samples,"checks":checks,"nextMilestone":nxt};ep.write_text(json.dumps(ev,indent=2)+"\n")
 print("----- CHECKS -----")
 for k,v in checks.items():print(f"{k}: {v}")
 print("CLASSIFICATION:",classification);print("STATUS: PASSED");print("STATE:",ev["state"]);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ep);print("\nR29A-R4-R2-R2-R2-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.");return 0
if __name__=="__main__":raise SystemExit(main())
