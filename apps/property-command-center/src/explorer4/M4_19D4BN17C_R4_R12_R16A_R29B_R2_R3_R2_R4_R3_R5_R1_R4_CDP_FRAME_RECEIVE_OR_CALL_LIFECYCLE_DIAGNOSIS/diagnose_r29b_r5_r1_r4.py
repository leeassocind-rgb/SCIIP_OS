#!/usr/bin/env python3
import sys,json,re,hashlib
from pathlib import Path

repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
er=pcc/"evidence/explorer4"
prior=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R3_CDP_CALL_TRANSPORT_METHOD_BINDING_REPAIR_AND_RECORD401_RECERTIFICATION/cdp_call_transport_method_binding_repair_and_record401_recertification.json"
outdir=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R4_CDP_FRAME_RECEIVE_OR_CALL_LIFECYCLE_DIAGNOSIS"
outdir.mkdir(parents=True,exist_ok=True)
ev=outdir/"cdp_frame_receive_or_call_lifecycle_diagnosis.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R5-R1-R4 CDP Frame Receive / Call Lifecycle Diagnosis")
print("="*120)
print("Mode: READ_ONLY_CDP_RECEIVE_AND_PENDING_RESOLUTION_DIAGNOSIS")
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
if pj.get("classification")!="CDP_CALL_TRANSPORT_REPAIRED_SEND_ERROR_CLEARED_NEXT_TRANSPORT_RESIDUAL_CAPTURED":
    raise SystemExit("BLOCKED: expected R5-R1-R3 transport classification absent")

o=pj.get("record401Outcome") or {}
if o.get("failure")!="CDP timeout Runtime.enable":
    raise SystemExit("BLOCKED: expected exact Runtime.enable timeout absent")

src=runner.read_text()
sha=hashlib.sha256(src.encode()).hexdigest()
print("RUNNER_SHA256:",sha)

cm=re.search(r'class\s+CDP\s*\{',src)
if not cm:
    raise SystemExit("BLOCKED: CDP class not found")

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
if end is None:
    raise SystemExit("BLOCKED: CDP class boundary unresolved")

cls=src[start:end]
base_line=src[:start].count("\n")+1

patterns=[
    ("DATA_LISTENER",r'\.on\(\s*["\']data["\']'),
    ("ONCE_DATA_LISTENER",r'\.once\(\s*["\']data["\']'),
    ("FRAME_PARSE",r'(?:opcode|payload|frame|masked|mask|0x81|0x82|0x89|0x8a|readUInt16BE|readUInt32BE|readBigUInt64BE)'),
    ("JSON_PARSE",r'JSON\.parse\s*\('),
    ("PENDING_GET",r'this\.pending\.get\s*\('),
    ("PENDING_HAS",r'this\.pending\.has\s*\('),
    ("PENDING_DELETE",r'this\.pending\.delete\s*\('),
    ("RESOLVE_CALL",r'\.resolve\s*\('),
    ("REJECT_CALL",r'\.reject\s*\('),
    ("MESSAGE_HANDLER",r'(?:onmessage|message|_onData|onData|handleData|_handleData)'),
]
hits=[]
for n,line in enumerate(cls.splitlines(),base_line):
    for kind,pat in patterns:
        if re.search(pat,line):
            hits.append({"kind":kind,"line":n,"source":line.strip()})

print("----- CDP RECEIVE / PENDING HITS -----")
for h in hits:
    print(f'{h["kind"]}: L{h["line"]}: {h["source"]}')

def method_source(name_pattern):
    m=re.search(name_pattern+r'\s*\([^)]*\)\s*\{',cls)
    if not m:
        return None,None
    abs_start=start+m.start()
    b=start+m.end()-1
    dep=0; qq=None; ee=False; abs_end=None
    for i in range(b,len(src)):
        ch=src[i]
        if qq:
            if ee: ee=False
            elif ch=="\\": ee=True
            elif ch==qq: qq=None
        else:
            if ch in ("'",'"','`'): qq=ch
            elif ch=="{": dep+=1
            elif ch=="}":
                dep-=1
                if dep==0:
                    abs_end=i+1
                    break
    if abs_end is None:
        return None,None
    return src[abs_start:abs_end], src[:abs_start].count("\n")+1

candidate_methods=[
    r'(?:async\s+)?call',
    r'(?:async\s+)?_onData',
    r'(?:async\s+)?onData',
    r'(?:async\s+)?handleData',
    r'(?:async\s+)?_handleData',
    r'(?:async\s+)?onMessage',
    r'(?:async\s+)?_onMessage'
]
captured=[]
for p in candidate_methods:
    s,l=method_source(p)
    if s and all(x["line"]!=l for x in captured):
        captured.append({"pattern":p,"line":l,"source":s})

for c in captured:
    print(f'----- METHOD @ L{c["line"]} ({c["pattern"]}) -----')
    for n,line in enumerate(c["source"].splitlines(),c["line"]):
        print(f"{n:5d}: {line}")

data_listeners=[h for h in hits if h["kind"] in ("DATA_LISTENER","ONCE_DATA_LISTENER")]
frame_hits=[h for h in hits if h["kind"]=="FRAME_PARSE"]
json_hits=[h for h in hits if h["kind"]=="JSON_PARSE"]
pending_get=[h for h in hits if h["kind"]=="PENDING_GET"]
resolve_hits=[h for h in hits if h["kind"]=="RESOLVE_CALL"]
message_hits=[h for h in hits if h["kind"]=="MESSAGE_HANDLER"]

has_receive_listener=bool(data_listeners)
has_frame_decoder=bool(frame_hits)
has_json_parse=bool(json_hits)
has_pending_resolution=bool(pending_get and resolve_hits)
has_named_receive_handler=bool(message_hits)

if not has_receive_listener:
    classification="RAW_SOCKET_SEND_PATH_CERTIFIED_BUT_NO_POST_UPGRADE_RECEIVE_LISTENER_BOUND"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R5_POST_UPGRADE_RECEIVE_LISTENER_AND_FRAME_DECODER_REPAIR"
elif has_receive_listener and not has_frame_decoder:
    classification="RAW_SOCKET_RECEIVE_LISTENER_PRESENT_BUT_RFC6455_SERVER_FRAME_DECODER_ABSENT"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R5_RFC6455_SERVER_FRAME_DECODER_AND_PENDING_RESOLUTION_REPAIR"
elif has_frame_decoder and not has_json_parse:
    classification="WEBSOCKET_FRAME_RECEIVE_PATH_PRESENT_BUT_CDP_JSON_DECODE_ABSENT"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R5_CDP_JSON_DECODE_AND_PENDING_RESOLUTION_REPAIR"
elif has_json_parse and not has_pending_resolution:
    classification="CDP_RESPONSE_JSON_DECODE_PRESENT_BUT_PENDING_PROMISE_RESOLUTION_PATH_ABSENT_OR_INCOMPLETE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R5_PENDING_PROMISE_RESOLUTION_REPAIR"
else:
    classification="CDP_RECEIVE_PATH_SURFACES_PRESENT_RUNTIME_ENABLE_TIMEOUT_REQUIRES_BOUNDED_RECEIVE_EVENT_INSTRUMENTATION"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R5_BOUNDED_RECEIVE_FRAME_AND_PENDING_RESOLUTION_RUNTIME_DIAGNOSIS"

checks={
 "priorTransportRepairConsumed":True,
 "runtimeEnableTimeoutConsumed":True,
 "runnerPresent":True,
 "cdpClassResolved":True,
 "receiveListenerEvaluated":True,
 "frameDecoderEvaluated":True,
 "jsonDecodeEvaluated":True,
 "pendingResolutionEvaluated":True,
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
print("POST_UPGRADE_RECEIVE_LISTENER_PRESENT:",has_receive_listener)
print("RFC6455_SERVER_FRAME_DECODER_PRESENT:",has_frame_decoder)
print("CDP_JSON_PARSE_PRESENT:",has_json_parse)
print("PENDING_PROMISE_RESOLUTION_PRESENT:",has_pending_resolution)
print("NAMED_RECEIVE_HANDLER_PRESENT:",has_named_receive_handler)
print("CLASSIFICATION:",classification)
print("STATUS: PASSED")
print("NEXT_MILESTONE:",nextm)

result={
 "framework":"SCIIP_EXPLORER_4_R29B_R5_R1_R4_CDP_FRAME_RECEIVE_OR_CALL_LIFECYCLE_DIAGNOSIS",
 "status":"PASSED",
 "classification":classification,
 "runnerSha256":sha,
 "priorFailure":"CDP timeout Runtime.enable",
 "receiveHits":hits,
 "capturedMethods":captured,
 "postUpgradeReceiveListenerPresent":has_receive_listener,
 "rfc6455ServerFrameDecoderPresent":has_frame_decoder,
 "cdpJsonParsePresent":has_json_parse,
 "pendingPromiseResolutionPresent":has_pending_resolution,
 "namedReceiveHandlerPresent":has_named_receive_handler,
 "checks":checks,
 "nextMilestone":nextm
}
ev.write_text(json.dumps(result,indent=2)+"\n")
print("EVIDENCE:",ev)
print("R29B-R5-R1-R4 EXECUTION COMPLETE — paste complete output into ChatGPT.")
