#!/usr/bin/env python3
import sys,re,json,hashlib
from pathlib import Path

repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
evidence=pcc/"evidence/explorer4"
prior=evidence/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R1_DUAL_EXPLORER_ENTRY_BINDING_CALLSITE_REPAIR_AND_RECORD401_RECERTIFICATION/dual_explorer_entry_binding_callsite_repair_and_record401_recertification.json"
outdir=evidence/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R2_EXPLORER_ENTRY_HELPER_RUNTIME_DIAGNOSIS"
outdir.mkdir(parents=True,exist_ok=True)
evout=outdir/"explorer_entry_helper_runtime_diagnosis.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R5-R1-R6-R2 Explorer Entry Helper Runtime Diagnosis")
print("="*120)
print("Mode: READ_ONLY_EXPLORER_ENTRY_HELPER_RUNTIME_SOURCE_DIAGNOSIS")
print("Application source mutation: OFF")
print("Governed data mutation: OFF")
print("Live UI interaction: OFF")
print("Property click: OFF")
print("Assignments invocation: OFF")
print("Generate invocation: OFF")
print("Export invocation: OFF")

if not runner.exists(): raise SystemExit("BLOCKED: authoritative R29B runner missing")
if not prior.exists(): raise SystemExit("BLOCKED: R6-R1 evidence missing")
pj=json.loads(prior.read_text())
o=pj.get("record401Outcome") or {}
if pj.get("classification")!="DUAL_EXPLORER_ENTRY_BINDING_REPAIRED_NEXT_ENTRY_RESIDUAL_CAPTURED":
    raise SystemExit("BLOCKED: expected R6-R1 classification absent")
if o.get("failure")!="ev is not defined":
    raise SystemExit("BLOCKED: exact residual 'ev is not defined' absent")

src=runner.read_text()
sha=hashlib.sha256(src.encode()).hexdigest()
print("RUNNER_SHA256:",sha)
print("PRIOR_FAILURE:",o.get("failure"))
print("PRIOR_FRESH_TARGET_CREATED:",o.get("freshTargetCreated"))
print("PRIOR_EXPLORER_SETTLE_CERTIFIED:",o.get("explorerSettleCertified"))

# Resolve the helper body robustly.
m=re.search(r'(?:async\s+)?function\s+r29bR4CertifyExplorerEntry\s*\(([^)]*)\)\s*\{',src)
if not m:
    m=re.search(r'(?:const|let|var)\s+r29bR4CertifyExplorerEntry\s*=\s*async\s*\(([^)]*)\)\s*=>\s*\{',src)
if not m: raise SystemExit("BLOCKED: r29bR4CertifyExplorerEntry helper not found")

param=m.group(1).strip()
brace=src.find("{",m.start())
depth=0; q=None; esc=False; end=None
for i in range(brace,len(src)):
    ch=src[i]
    if q:
        if esc: esc=False
        elif ch=="\\": esc=True
        elif ch==q: q=None
    else:
        if ch in ("'",'"','`'): q=ch
        elif ch=="{": depth+=1
        elif ch=="}":
            depth-=1
            if depth==0: end=i+1; break
if end is None: raise SystemExit("BLOCKED: helper boundary unresolved")
helper=src[m.start():end]
start_line=src.count("\n",0,m.start())+1
print("ENTRY_HELPER_PARAMETER:",param)
print("ENTRY_HELPER_START_LINE:",start_line)
print("----- ENTRY HELPER SOURCE -----")
for n,line in enumerate(helper.splitlines(),start_line):
    print(f"{n:5d}: {line}")

ev_calls=[]
for x in re.finditer(r'\bev\s*\((.*?)\)',helper,re.S):
    line=start_line+helper.count("\n",0,x.start())
    snippet=" ".join(x.group(0).split())
    ev_calls.append({"line":line,"source":snippet[:500]})
print("EV_CALL_COUNT:",len(ev_calls))
for i,h in enumerate(ev_calls,1):
    print(f"EV_CALL_{i}: L{h['line']}: {h['source']}")

# Determine whether any ev declaration exists anywhere in authoritative runner.
decl_patterns=[
    r'\bfunction\s+ev\s*\(',
    r'\bconst\s+ev\s*=',
    r'\blet\s+ev\s*=',
    r'\bvar\s+ev\s*='
]
ev_decl=[]
for pat in decl_patterns:
    for x in re.finditer(pat,src):
        ev_decl.append({"line":src.count("\n",0,x.start())+1,"source":src[x.start():src.find("\n",x.start()) if src.find("\n",x.start())!=-1 else len(src)].strip()})
print("EV_DECLARATION_COUNT:",len(ev_decl))
for i,h in enumerate(ev_decl,1): print(f"EV_DECLARATION_{i}: L{h['line']}: {h['source']}")

# Resolve CDP evaluation-capable methods from class body.
cm=re.search(r'class\s+CDP\s*\{',src)
cdp_methods=[]
if cm:
    # Capture method names in a bounded slice beginning at class.
    sl=src[cm.start():]
    for x in re.finditer(r'(?m)^\s*(?:async\s+)?([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{',sl):
        name=x.group(1)
        if name in ("eval","evaluate","call","open","_onData","onData","handleData","_handleData"):
            cdp_methods.append({"name":name,"line":src.count("\n",0,cm.start()+x.start())+1,"params":x.group(2).strip()})
print("CDP_RELEVANT_METHODS:",json.dumps(cdp_methods,separators=(",",":")))

runtime_eval_hits=[]
for x in re.finditer(r'Runtime\.evaluate',src):
    line=src.count("\n",0,x.start())+1
    a=max(0,src.rfind("\n",0,x.start())+1); b=src.find("\n",x.start()); b=len(src) if b<0 else b
    runtime_eval_hits.append({"line":line,"source":src[a:b].strip()})
print("RUNTIME_EVALUATE_HIT_COUNT:",len(runtime_eval_hits))
for i,h in enumerate(runtime_eval_hits,1): print(f"RUNTIME_EVALUATE_{i}: L{h['line']}: {h['source']}")

# Inspect helper parameter semantics against callsites.
calls=[]
for x in re.finditer(r'r29bR4CertifyExplorerEntry\s*\(([^)]*)\)',src):
    line=src.count("\n",0,x.start())+1
    calls.append({"line":line,"arg":x.group(1).strip(),"source":" ".join(x.group(0).split())})
print("ENTRY_HELPER_CALLS:",json.dumps(calls,separators=(",",":")))

has_ev_calls=bool(ev_calls)
has_ev_decl=bool(ev_decl)
cdp_eval_names={x["name"] for x in cdp_methods}
has_cdp_eval=bool({"eval","evaluate"} & cdp_eval_names)
has_call="call" in cdp_eval_names
calls_bound_cdp=bool(calls) and all(x["arg"]=="cdp" for x in calls)

if has_ev_calls and not has_ev_decl and has_cdp_eval and calls_bound_cdp:
    classification="EXPLORER_ENTRY_HELPER_RETains_UNDEFINED_LEGACY_EV_CALLS_WHILE_CALLSITES_NOW_BIND_CDP_EVALUATOR"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R3_EXPLORER_ENTRY_EV_TO_CDP_EVALUATOR_REPAIR_AND_RECORD401_RECERTIFICATION"
elif has_ev_calls and not has_ev_decl and has_call and calls_bound_cdp:
    classification="EXPLORER_ENTRY_HELPER_RETains_UNDEFINED_LEGACY_EV_CALLS_CDP_CALL_RUNTIME_EVALUATE_PATH_AVAILABLE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R3_EXPLORER_ENTRY_EV_ADAPTER_REPAIR_AND_RECORD401_RECERTIFICATION"
elif has_ev_calls and not has_ev_decl:
    classification="EXPLORER_ENTRY_HELPER_UNDEFINED_EV_CONFIRMED_EVALUATION_REPLACEMENT_SURFACE_REQUIRES_REPAIR"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R3_EXPLORER_ENTRY_EV_RUNTIME_REPAIR"
else:
    classification="EV_REFERENCE_ERROR_SOURCE_NOT_CONFIRMED_IN_ENTRY_HELPER"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R3_EV_REFERENCE_ORIGIN_DEEP_DIAGNOSIS"

checks={
 "priorR6R1Consumed":True,
 "exactEvReferenceErrorConsumed":True,
 "entryHelperResolved":True,
 "entryHelperSourceCaptured":True,
 "evCallsCaptured":True,
 "evDeclarationEvaluated":True,
 "cdpRelevantMethodsCaptured":True,
 "runtimeEvaluateSurfacesCaptured":True,
 "entryHelperCallsitesCaptured":True,
 "applicationMutationOff":True,
 "governedMutationOff":True,
 "liveUiInteractionOff":True,
 "propertyClickOff":True,
 "assignmentsInvocationOff":True,
 "generateInvocationOff":True,
 "exportInvocationOff":True
}
print("----- CHECKS -----")
for k,v in checks.items(): print(f"{k}: {v}")
print("CLASSIFICATION:",classification)
print("STATUS: PASSED")
print("NEXT_MILESTONE:",nextm)

result={"framework":"SCIIP_EXPLORER_4_R29B_R5_R1_R6_R2_EXPLORER_ENTRY_HELPER_RUNTIME_DIAGNOSIS",
"status":"PASSED","classification":classification,"runnerSha256":sha,"priorFailure":"ev is not defined",
"entryHelperParameter":param,"entryHelperStartLine":start_line,"evCalls":ev_calls,"evDeclarations":ev_decl,
"cdpRelevantMethods":cdp_methods,"runtimeEvaluateHits":runtime_eval_hits,"entryHelperCalls":calls,
"checks":checks,"nextMilestone":nextm}
evout.write_text(json.dumps(result,indent=2)+"\n")
print("EVIDENCE:",evout)
print("R29B-R5-R1-R6-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
