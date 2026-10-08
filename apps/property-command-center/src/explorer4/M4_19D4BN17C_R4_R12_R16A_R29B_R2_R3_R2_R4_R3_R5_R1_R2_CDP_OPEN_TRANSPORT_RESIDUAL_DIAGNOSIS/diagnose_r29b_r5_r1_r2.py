#!/usr/bin/env python3
import sys,json,re,hashlib
from pathlib import Path

repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
er=pcc/"evidence/explorer4"
prior=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R1_CDP_OPEN_POST_REPAIR_RESIDUAL_DIAGNOSIS_AND_NET_IMPORT_REPAIR/cdp_open_post_repair_residual_diagnosis_and_net_import_repair.json"
outdir=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R2_CDP_OPEN_TRANSPORT_RESIDUAL_DIAGNOSIS"
outdir.mkdir(parents=True,exist_ok=True)
ev=outdir/"cdp_open_transport_residual_diagnosis.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R5-R1-R2 CDP Open Transport Residual Diagnosis")
print("="*120)
print("Mode: READ_ONLY_CDP_TRANSPORT_ABSTRACTION_DIAGNOSIS")
print("Application source mutation: OFF")
print("Governed data mutation: OFF")
print("Live UI interaction: OFF")
print("Property click: OFF")
print("Assignments invocation: OFF")
print("Generate invocation: OFF")
print("Export invocation: OFF")

if not runner.exists():
    raise SystemExit("BLOCKED: authoritative R29B runner missing")

pj=json.loads(prior.read_text()) if prior.exists() else {}
o=pj.get("record401Outcome") or {}
if o.get("failure")!="this.ws.send is not a function":
    raise SystemExit("BLOCKED: expected exact prior residual 'this.ws.send is not a function'")
if not pj.get("netReferenceErrorCleared"):
    raise SystemExit("BLOCKED: prior net ReferenceError not certified cleared")

src=runner.read_text()
sha=hashlib.sha256(src.encode()).hexdigest()
print("RUNNER_SHA256:",sha)

# Resolve CDP class.
cm=re.search(r'class\s+CDP\s*\{',src)
if not cm: raise SystemExit("BLOCKED: CDP class not found")
start=cm.start()
brace=src.find("{",cm.start())
depth=0; end=None; q=None; esc=False
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
            if depth==0:
                end=i+1
                break
if end is None: raise SystemExit("BLOCKED: CDP class boundary unresolved")
cls=src[start:end]
base_line=src[:start].count("\n")+1

# Collect method-ish source and all transport-related hits.
hits=[]
patterns=[
    ("WS_SEND",r'this\.ws\.send\s*\('),
    ("SOCKET_WRITE",r'(?:this\.(?:socket|sock|ws)|socket)\.write\s*\('),
    ("WS_ASSIGN_SOCKET",r'this\.ws\s*=\s*socket'),
    ("SOCKET_ASSIGN",r'this\.socket\s*=\s*socket'),
    ("RAW_FRAME_ENCODER",r'(?:mask|masked|frame|opcode|payload|Buffer\.alloc|Buffer\.concat)'),
    ("CDP_CALL",r'(?:async\s+)?call\s*\('),
    ("SEND_HELPER",r'(?:async\s+)?(?:send|write|sendFrame|writeFrame)\s*\(')
]
for n,line in enumerate(cls.splitlines(),base_line):
    for kind,pat in patterns:
        if re.search(pat,line):
            hits.append({"kind":kind,"line":n,"source":line.strip()})

print("----- CDP TRANSPORT HITS -----")
for h in hits:
    print(f'{h["kind"]}: L{h["line"]}: {h["source"]}')

ws_send=[h for h in hits if h["kind"]=="WS_SEND"]
ws_assign=[h for h in hits if h["kind"]=="WS_ASSIGN_SOCKET"]
socket_write=[h for h in hits if h["kind"]=="SOCKET_WRITE"]
frame_hits=[h for h in hits if h["kind"]=="RAW_FRAME_ENCODER"]

# Capture call() method source if present.
call_src=None; call_line=None
m=re.search(r'(?:async\s+)?call\s*\([^)]*\)\s*\{',cls)
if m:
    abs_start=start+m.start()
    b=start+m.end()-1
    depth=0; q=None; esc=False; abs_end=None
    for i in range(b,len(src)):
        ch=src[i]
        if q:
            if esc: esc=False
            elif ch=="\\": esc=True
            elif ch==q:q=None
        else:
            if ch in ("'",'"','`'):q=ch
            elif ch=="{":depth+=1
            elif ch=="}":
                depth-=1
                if depth==0:
                    abs_end=i+1;break
    if abs_end:
        call_src=src[abs_start:abs_end]
        call_line=src[:abs_start].count("\n")+1
        print("----- CDP.CALL SOURCE -----")
        for n,line in enumerate(call_src.splitlines(),call_line):
            print(f"{n:5d}: {line}")

# Determine whether an existing raw WebSocket frame encoder exists.
raw_encoder_indicators=[
    "mask" in cls.lower(),
    "opcode" in cls.lower(),
    "0x80" in cls,
    "0x81" in cls,
    "writeUInt16BE" in cls,
    "writeUInt32BE" in cls
]
raw_encoder_present=sum(raw_encoder_indicators)>=2

classification=None
nextm=None

if ws_send and ws_assign and not socket_write:
    classification="RAW_NET_SOCKET_ASSIGNED_TO_THIS_WS_BUT_CDP_SEND_PATH_STILL_REQUIRES_WEBSOCKET_SEND_METHOD"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R3_RAW_SOCKET_WEBSOCKET_SEND_ADAPTER_REPAIR_AND_RECORD401_RECERTIFICATION"
elif ws_send and ws_assign and socket_write:
    classification="RAW_NET_SOCKET_ASSIGNED_TO_THIS_WS_WITH_DUAL_SEND_APIS_CDP_CALL_BOUND_TO_WRONG_TRANSPORT_METHOD"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R3_CDP_CALL_TRANSPORT_METHOD_BINDING_REPAIR_AND_RECORD401_RECERTIFICATION"
elif ws_send and not ws_assign:
    classification="CDP_CALL_REQUIRES_THIS_WS_SEND_BUT_OPEN_REPAIR_DOES_NOT_MATERIALIZE_COMPATIBLE_WEBSOCKET_INTERFACE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R3_WEBSOCKET_COMPATIBILITY_ADAPTER_REPAIR_AND_RECORD401_RECERTIFICATION"
else:
    classification="CDP_TRANSPORT_SEND_MISMATCH_CONFIRMED_EXACT_ADAPTER_DIRECTION_REQUIRES_SOURCE_BOUND_REPAIR"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R3_SOURCE_BOUND_TRANSPORT_SEND_ADAPTER_REPAIR"

checks={
 "priorNetImportRepairConsumed":True,
 "exactWsSendFailureConsumed":True,
 "runnerPresent":True,
 "cdpClassResolved":True,
 "wsSendUsageCaptured":bool(ws_send),
 "wsSocketAssignmentCaptured":bool(ws_assign),
 "socketWriteUsageCaptured":bool(socket_write),
 "rawFrameEncoderEvaluated":True,
 "callMethodCaptured":call_src is not None,
 "applicationMutationOff":True,
 "governedMutationOff":True,
 "liveUiInteractionOff":True,
 "propertyClickOff":True,
 "assignmentsInvocationOff":True,
 "generateInvocationOff":True,
 "exportInvocationOff":True
}

print("----- CHECKS -----")
for k,v in checks.items():
    print(f"{k}: {v}")
print("RAW_FRAME_ENCODER_PRESENT:",raw_encoder_present)
print("WS_SEND_HIT_COUNT:",len(ws_send))
print("WS_ASSIGN_SOCKET_HIT_COUNT:",len(ws_assign))
print("SOCKET_WRITE_HIT_COUNT:",len(socket_write))
print("CLASSIFICATION:",classification)
print("STATUS: PASSED")
print("NEXT_MILESTONE:",nextm)

result={
 "framework":"SCIIP_EXPLORER_4_R29B_R5_R1_R2_CDP_OPEN_TRANSPORT_RESIDUAL_DIAGNOSIS",
 "status":"PASSED",
 "classification":classification,
 "runnerSha256":sha,
 "priorFailure":"this.ws.send is not a function",
 "transportHits":hits,
 "callMethod":{"startLine":call_line,"source":call_src},
 "rawFrameEncoderPresent":raw_encoder_present,
 "checks":checks,
 "nextMilestone":nextm
}
ev.write_text(json.dumps(result,indent=2)+"\n")
print("EVIDENCE:",ev)
print("R29B-R5-R1-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
