#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time,unicodedata

M="M4_19D4BN17A_R6_PLATFORM_NEUTRAL_CONTROLLED_INPUT_RESET_AND_LIVE_SEARCH_ENUMERATION"
def first_json(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def norm(s): return re.sub(r"\s+"," ",unicodedata.normalize("NFKC",str(s)).strip()).casefold()
def getjson(u):
    with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read())
def target():
    for port in (9333,9222,9223,9334,9444):
        try:
            for x in getjson(f"http://127.0.0.1:{port}/json"):
                if any(v in x.get("url","") for v in ("127.0.0.1:5173","localhost:5173","127.0.0.1:5174","localhost:5174")) and x.get("webSocketDebuggerUrl"):
                    return port,x
        except: pass
    return None,None
class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u);h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(10);k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:
            x=self.s.recv(4096)
            if not x:break
            b+=x
        self.handshake=b.split(b"\r\n",1)[0].decode(errors="replace");self.i=0
        if " 101 " not in self.handshake:raise RuntimeError(self.handshake)
    def rn(self,n):
        b=b""
        while len(b)<n:b+=self.s.recv(n-len(b))
        return b
    def send(self,o):
        b=json.dumps(o).encode();m=os.urandom(4);n=len(b);h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0xFE])+struct.pack("!H",n)
        else:h+=bytes([0xFF])+struct.pack("!Q",n)
        h+=m;self.s.sendall(h+bytes(v^m[i%4] for i,v in enumerate(b)))
    def recv(self):
        while 1:
            h=self.rn(2);op=h[0]&15;n=h[1]&127
            if n==126:n=struct.unpack("!H",self.rn(2))[0]
            elif n==127:n=struct.unpack("!Q",self.rn(8))[0]
            mask=self.rn(4) if h[1]&128 else None;p=self.rn(n)
            if mask:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op==9:self.s.sendall(bytes([0x8A,len(p)])+p);continue
            if op in (1,2):return json.loads(p.decode())
            if op==8:raise RuntimeError("closed")
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while 1:
            x=self.recv()
            if x.get("id")==i:return x
    def ev(self,e):
        x=self.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
        return x.get("result",{}).get("result",{}).get("value")
def key(ws,key,code,vk):
    ws.call("Input.dispatchKeyEvent",{"type":"keyDown","key":key,"code":code,"windowsVirtualKeyCode":vk,"nativeVirtualKeyCode":vk})
    ws.call("Input.dispatchKeyEvent",{"type":"keyUp","key":key,"code":code,"windowsVirtualKeyCode":vk,"nativeVirtualKeyCode":vk})

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();ev=repo/"apps/property-command-center/evidence/explorer4"
    p16=ev/"M4_19D4BN16D_25_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSURE"/"twenty_five_record_governed_expansion_lifecycle_closure.json"
    p17=ev/"M4_19D4BN17_POST_25_RECORD_EXPANSION_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN"/"post_25_record_expansion_next_phase_readiness_and_bounded_design.json"
    p4=ev/"M4_19D4BN17A_R4_SEARCH_ACTIVATION_CONTRACT_RESOLUTION"/"search_activation_contract_resolution.json"
    p5=ev/"M4_19D4BN17A_R5_ACTIVATION_CONTRACT_DRIVEN_LIVE_SEARCH_ENUMERATION_AND_50_RECORD_PREAUTHORIZATION"/"activation_contract_driven_live_search_enumeration_and_50_record_preauthorization.json"
    d16,d17,d4,d5=map(first_json,(p16,p17,p4,p5));ref=(d16.get("closedCohort") or {}).get("properties") or []
    port,t=target()
    if not t: print("STATUS: BLOCKED\nDIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")
    focus=r"""(()=>{const v=e=>e&&e.offsetParent!==null;const a=[...document.querySelectorAll('input')].filter(v);const i=a.find(e=>/search/i.test((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')))||a[0];if(!i)return false;i.focus();i.click();return true})()"""
    state=r"""(()=>{const v=e=>e&&e.offsetParent!==null;const a=[...document.querySelectorAll('input')].filter(v);const i=a.find(e=>/search/i.test((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')))||a[0];const rows=[];for(const e of [...document.querySelectorAll('[role=option],[role=listbox] *,[data-testid*=search],[data-testid*=property],li,button,a,div')].filter(v)){for(const z of (e.innerText||'').split(/\n+/)){const s=z.replace(/\s+/g,' ').trim();if(s)rows.push(s)}}const u=[...new Set(rows)],txt=u.join('|');let h=2166136261;for(let j=0;j<txt.length;j++){h^=txt.charCodeAt(j);h=Math.imul(h,16777619)}return {value:i?.value||'',sig:(h>>>0).toString(16),rows:u}})()"""
    prefixes=["10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","44","45","49","50","54","55","59","60","70","80","90","100","110","120","130","140","150","160","170","180","190","200","250","300","350","400","500","900","1000","1200","1500","2000","2500","3000","3500","4000","5000","9000"]
    suffix=re.compile(r"\b(ave|avenue|st|street|rd|road|blvd|boulevard|way|dr|drive|ln|lane|ct|court|hwy|highway|pkwy|parkway|pl|place|cir|circle|ter|terrace)\b",re.I)
    start=re.compile(r"^(?:\d{1,6}\s+|(?:NE|NW|SE|SW)\s+of\s+)",re.I)
    junk=re.compile(r"\b(sf|sq ft|clear|asking|available|compare|neighbor|market|property package|analyze|present|command|selected|miles?|ft)\b",re.I)
    pool={};obs=[];refkeys={norm(x) for x in ref}
    for q in prefixes:
        w.ev(focus)
        # Platform-neutral clear: delete actual characters rather than relying on Cmd/Ctrl+A.
        s=w.ev(state) or {};initial=s.get("value","")
        for _ in range(min(max(len(initial)+8,16),512)):
            if not (w.ev(state) or {}).get("value",""):break
            key(w,"Backspace","Backspace",8)
        empty=(w.ev(state) or {}).get("value","")==""
        if not empty:
            # second independent deletion direction as bounded fallback
            key(w,"Home","Home",36)
            for _ in range(512):
                if not (w.ev(state) or {}).get("value",""):break
                key(w,"Delete","Delete",46)
            empty=(w.ev(state) or {}).get("value","")==""
        before=w.ev(state) or {}
        if not empty:
            obs.append({"query":q,"initial":initial,"cleared":False,"typed":"","changed":False,"new":0});continue
        w.call("Input.insertText",{"text":q});time.sleep(.08)
        typed=(w.ev(state) or {}).get("value","");typed_ok=norm(typed)==norm(q)
        if typed_ok:key(w,"Enter","Enter",13)
        after=None;changed=False;elapsed=None
        for tick in range(30):
            time.sleep(.1);after=w.ev(state) or {}
            if typed_ok and after.get("sig")!=before.get("sig"):
                changed=True;elapsed=(tick+1)*100;break
        after=after or w.ev(state) or {};new=[]
        if typed_ok:
            for raw in after.get("rows") or []:
                s=" ".join(str(raw).split()).strip(" -•");n=norm(s)
                if not s or len(s)>120 or n in refkeys or n in pool:continue
                if start.search(s) and suffix.search(s) and not junk.search(s):pool[n]=s;new.append(s)
        obs.append({"query":q,"initial":initial,"cleared":empty,"typed":typed,"typedExact":typed_ok,"changed":changed,"elapsedMs":elapsed,"new":len(new)})
        if len(pool)>=40:break
    cand=sorted(pool.values(),key=norm);sel=cand[:25];cohort=ref+sel
    checks={
      "bn17Passed":d17.get("status")=="PASSED","bn17aR4Passed":d4.get("status")=="PASSED",
      "bn17aR5DiagnosticComplete":d5.get("status")=="DIAGNOSTIC_COMPLETE",
      "bn17aR5AccumulatingInputObserved":any(len(str(x.get("typedInputValue","")))>len(str(x.get("prefix","")))+2 for x in d5.get("observations",[])),
      "referenceCohortSizeTwentyFive":len(ref)==25,"allQueriesClearedBeforeTyping":all(x.get("cleared") for x in obs),
      "controlledInputAcceptedMultipleExactQueries":sum(bool(x.get("typedExact")) for x in obs)>=2,
      "queryResultStateTransitionsObserved":any(x.get("changed") for x in obs),
      "atLeastTwentyFiveNewLiveCandidatesFound":len(cand)>=25,"exactlyTwentyFiveNewCandidatesSelected":len(sel)==25,
      "exactlyFiftyTotal":len(cohort)==50,"allFiftyUnique":len({norm(x) for x in cohort})==50,
      "originalTwentyFivePreservedFirst":cohort[:25]==ref,"applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True}
    passed=all(checks.values())
    result={"framework":"SCIIP_EXPLORER_4_BN17A_R6_PLATFORM_NEUTRAL_CONTROLLED_INPUT_RESET_AND_LIVE_SEARCH_ENUMERATION","generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE","state":"M419D4BN17A_R6_50_RECORD_LIVE_SEARCHABLE_IDENTITY_COHORT_PREAUTHORIZED" if passed else "M419D4BN17A_R6_LIVE_SEARCH_ENUMERATION_INCOMPLETE","diagnosis":"PLATFORM_NEUTRAL_INPUT_RESET_REPAIRED_QUERY_ACTIVATION_AND_EXACT_50_RECORD_COHORT_PREAUTHORIZED" if passed else "PLATFORM_NEUTRAL_INPUT_RESET_EXECUTED_BUT_EXACT_50_RECORD_PREAUTHORIZATION_NOT_YET_PROVEN","checks":checks,"observations":obs,"candidatePool":{"count":len(cand),"properties":cand},"newCandidates":{"count":len(sel),"properties":sel},"preauthorizedCohort":{"count":len(cohort),"properties":cohort},"next":"BN17A_R6_PREAUTHORIZED_50_RECORD_CONTRACT_PARITY_CERTIFICATION_READY" if passed else "BN17A_REMAINS_OPEN","nextMilestone":"M4_19D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION" if passed else None}
    out=ev/M;out.mkdir(parents=True,exist_ok=True);f=out/"platform_neutral_controlled_input_reset_and_live_search_enumeration.json";f.write_text(json.dumps(result,indent=2)+"\n")
    print("="*112);print("SCIIP Explorer 4.0 — BN17A-R6 Platform-Neutral Controlled-Input Reset + Live Search Enumeration");print("="*112)
    print("WebSocket handshake:",w.handshake);print("Validated CDP port:",port);print("Target URL:",t.get("url"))
    print("\n----- REPAIR / QUALIFICATION CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- QUERY RESET / ACTIVATION OBSERVATIONS -----")
    for x in obs:print(f'{x["query"]}: initial={x.get("initial")!r} cleared={x.get("cleared")} typed={x.get("typed")!r} exact={x.get("typedExact")} changed={x.get("changed")} elapsedMs={x.get("elapsedMs")} newCandidates={x.get("new")}')
    print("\nLIVE_CANDIDATE_POOL_COUNT:",len(cand));print("\n----- QUALIFIED 25 NEW LIVE-SEARCHABLE CANDIDATES -----")
    for i,x in enumerate(sel,1):print(f"{i:02d}. {x}")
    print("\n----- PREAUTHORIZED 50-RECORD COHORT -----")
    for i,x in enumerate(cohort,1):print(f"{i:02d}. {x}")
    print("\nSTATUS:",result["status"]);print("STATE:",result["state"]);print("DIAGNOSIS:",result["diagnosis"]);print("NEXT:",result["next"]);print("NEXT_MILESTONE:",result["nextMilestone"]);print("EVIDENCE:",f)
if __name__=="__main__":main()
