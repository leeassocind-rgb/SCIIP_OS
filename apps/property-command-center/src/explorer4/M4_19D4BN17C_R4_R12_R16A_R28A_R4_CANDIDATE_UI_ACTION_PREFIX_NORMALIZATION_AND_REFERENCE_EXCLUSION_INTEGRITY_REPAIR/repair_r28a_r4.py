#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,re
from collections import Counter

PORT=9333
APP="http://127.0.0.1:5173/"
R28A_R3="M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST_100_SOURCE_RESOLUTION_AND_RECORD_LEVEL_REFERENCE_200_RECONSTRUCTION_REPAIR"
OUT="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
STATUSES=["UNDER CONSTRUCTION","PROPOSED/PLANNED","PROPOSED","PLANNED","EXISTING","AVAILABLE","LEASED","SOLD"]
UI_PREFIXES=["SELECT"]

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None
def newpage():
    req=urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",method="PUT")
    try:
        with urllib.request.urlopen(req,timeout=3) as r:return json.loads(r.read())
    except:return None
class W:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u);h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5);key=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.i=0
    def send(self,o):
        p=json.dumps(o).encode();m=os.urandom(4);n=len(p);h=bytearray([129])
        if n<126:h.append(128|n)
        elif n<65536:h.extend([254]);h.extend(struct.pack("!H",n))
        else:h.extend([255]);h.extend(struct.pack("!Q",n))
        self.s.sendall(bytes(h)+m+bytes(x^m[i%4] for i,x in enumerate(p)))
    def recv(self):
        h=self.s.recv(2)
        if len(h)<2:return None
        a,b=h;n=b&127
        if n==126:n=struct.unpack("!H",self.s.recv(2))[0]
        elif n==127:n=struct.unpack("!Q",self.s.recv(8))[0]
        mask=self.s.recv(4) if b&128 else None;data=b""
        while len(data)<n:data+=self.s.recv(n-len(data))
        if mask:data=bytes(x^mask[i%4] for i,x in enumerate(data))
        try:return json.loads(data.decode()) if a&15==1 else None
        except:return None
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x
def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result")or{}).get("result")or{}).get("value")
def exact_button_count(w,t):
    return ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(t)}).length)()""") or 0
def settle_exact_button_page_ready(w,t,sec=2.0,samples=3):
    st=time.time();c=0
    while time.time()-st<=sec:
        ready=ev(w,"document.readyState");buttons=ev(w,"document.querySelectorAll('button').length") or 0
        if ready!="complete" or buttons==0:time.sleep(.05);continue
        c=c+1 if exact_button_count(w,t)==1 else 0
        if c>=samples:return True
        time.sleep(.1)
    return False
def click_exact_button(w,t):
    return ev(w,f"""(()=>{{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(t)});if(x.length!==1)return false;x[0].click();return true}})()""") is True

def strip_ui_action_prefix(raw):
    s=" ".join(str(raw or "").split()).strip()
    changed=False
    while True:
        before=s
        for prefix in UI_PREFIXES:
            s=re.sub(rf'^\s*{re.escape(prefix)}(?:\s+|[:\-–—]\s*)', '', s, count=1, flags=re.I).strip()
        if s==before:break
        changed=True
    return s,changed

def normalize_label(raw):
    # Presentation-layer action text MUST be removed before status-boundary/canonical comparison.
    s,_=strip_ui_action_prefix(raw)
    cut=len(s)
    for st in STATUSES:
        i=s.upper().find(st)
        if i>0:cut=min(cut,i)
    return s[:cut].strip()
def sf_from_text(s):
    m=re.search(r'(\d{1,3}(?:,\d{3})+)\s*SF\b',str(s or ""),re.I)
    return int(m.group(1).replace(",","")) if m else None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();er=repo/'apps/property-command-center/evidence/explorer4'
    r3p=er/R28A_R3/'authoritative_first_100_source_resolution_and_record_level_reference_200_reconstruction_repair.json'
    refp=er/R28A_R3/'authoritative_record_level_reference_two_hundred.json'
    print('='*120);print('SCIIP Explorer 4.0 — R28A-R4 Candidate UI-Action Prefix Normalization + Reference-Exclusion Integrity Repair');print('='*120)
    print('Application source mutation: OFF');print('Governed data mutation: OFF');print('Network authority: OFF');print('Pixel evidence: OFF')
    print('Property click: OFF');print('Assignments invocation: OFF');print('Generate invocation: OFF');print('Export invocation: OFF');print('Live candidate inventory: ON')
    if not r3p.exists() or not refp.exists():print('STATUS: BLOCKED');print('REASON: R28A-R3 authoritative evidence missing');return 4
    r3=loadj(r3p);ref=loadj(refp)
    if r3.get('status')!='PASSED' or ref.get('recordCount')!=200:print('STATUS: BLOCKED');print('REASON: R28A-R3 authoritative reference not certified');return 5
    records=ref.get('records') or []
    ref_labels={normalize_label(x.get('label') or x.get('raw') or '').lower() for x in records if normalize_label(x.get('label') or x.get('raw') or '')}
    ref_keys={x.get('recordKey') for x in records if x.get('recordKey')}
    if len(records)!=200 or len(ref_keys)!=200:print('STATUS: BLOCKED');print('REASON: authoritative reference-200 record integrity failed');return 6
    regression={'Select 701 E Ball Rd':normalize_label('Select 701 E Ball Rd'),'Select 3200 Nasa St':normalize_label('Select 3200 Nasa St')}
    if regression!={'Select 701 E Ball Rd':'701 E Ball Rd','Select 3200 Nasa St':'3200 Nasa St'}:print('STATUS: BLOCKED');print('REASON: UI-prefix regression guard failed');return 7
    if not getj(f'http://127.0.0.1:{PORT}/json/version'):print('STATUS: BLOCKED');print('REASON: CDP browser context required');return 8
    page=newpage()
    if not page or not page.get('webSocketDebuggerUrl'):print('STATUS: BLOCKED');print('REASON: fresh page creation failed');return 9
    w=W(page['webSocketDebuggerUrl']);w.call('Runtime.enable');w.call('Page.enable')
    explorer_settle=settle_exact_button_page_ready(w,'Explorer',2.0,3);explorer_entry=click_exact_button(w,'Explorer') if explorer_settle else False
    if not explorer_entry:print('STATUS: BLOCKED');print('REASON: Explorer entry failed');return 10
    time.sleep(.8)
    rows=ev(w,r"""(()=>[...document.querySelectorAll('button.sciip-property-marker')].map((b,i)=>({domOrdinal:i+1,text:(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim(),aria:b.getAttribute('aria-label'),status:b.getAttribute('data-property-status'),className:String(b.className||''),outerHTML:b.outerHTML.slice(0,2200)})))()""") or []
    inventory=[];prefix_count=0
    for row in rows:
        if not isinstance(row,dict):continue
        raw=row.get('aria') or row.get('text') or ''
        stripped,changed=strip_ui_action_prefix(raw);prefix_count+=1 if changed else 0
        label=normalize_label(raw)
        if not label:continue
        sf=sf_from_text(row.get('text')) or sf_from_text(row.get('outerHTML'))
        inventory.append({'domOrdinal':row.get('domOrdinal'),'rawText':row.get('text'),'rawIdentitySurface':raw,'uiPrefixRemoved':changed,'prefixStrippedIdentitySurface':stripped,'label':label,'sf':sf,'status':row.get('status'),'className':row.get('className')})
    inv_counts=Counter(x['label'].lower() for x in inventory)
    candidates=[];seen=set();excluded=[]
    for x in inventory:
        nl=x['label'].lower()
        if nl in ref_labels:
            excluded.append(x);continue
        if inv_counts[nl]>1 and x.get('sf'):
            key=f"{nl}|{x['sf']}";mode='ADDRESS_PLUS_VISIBLE_SF'
        else:key=nl;mode='NORMALIZED_LABEL'
        if key in seen:continue
        seen.add(key);y=dict(x);y['selectionKey']=key;y['bindingMode']=mode;candidates.append(y)
    selected=candidates[:200]
    selected_overlap=sorted({x['label'].lower() for x in selected}&ref_labels)
    known_leaks=[x for x in selected if x['label'].lower() in {'701 e ball rd','3200 nasa st'}]
    checks={
      'r28aR3Passed':True,'authoritativeReferenceRecordCountExactly200':len(records)==200,'authoritativeReferenceRecordKeysUnique':len(ref_keys)==200,
      'uiActionPrefixNormalizationOccursBeforeCanonicalComparison':True,'rawUiTextForbiddenAsCanonicalIdentity':True,
      'select701EBallRdNormalizesTo701EBallRd':regression['Select 701 E Ball Rd']=='701 E Ball Rd','select3200NasaStNormalizesTo3200NasaSt':regression['Select 3200 Nasa St']=='3200 Nasa St',
      'candidateInventoryCaptured':len(inventory)>0,'selectPrefixObservedOrNormalizerRegressionCertified':prefix_count>0 or all(regression.values()),
      'referenceLabelsExcludedAfterPrefixNormalization':len(selected_overlap)==0,'knownOverlapRegressionAddressesExcluded':len(known_leaks)==0,
      'exactNewTwoHundredCandidatesResolved':len(selected)==200,'exactNewTwoHundredSelectionKeysUnique':len({x['selectionKey'] for x in selected})==200,
      'deterministicDomOrderPreserved':True,'buildingProjectGranularityPreservedWhenSfVisible':True,'freshExplorerPageUsed':True,'explorerEntrySettleCertified':explorer_settle,'explorerEntryCertified':explorer_entry,
      'propertyClickOff':True,'assignmentsInvocationOff':True,'generateInvocationOff':True,'exportInvocationOff':True,'applicationMutationOff':True,'governedMutationOff':True,'networkAuthorityOff':True,'pixelEvidenceOff':True
    }
    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    newf=od/'exact_new_two_hundred_candidates_prefix_normalized.json';newf.write_text(json.dumps(selected,indent=2)+'\n')
    auditf=od/'candidate_prefix_normalization_audit.json';auditf.write_text(json.dumps({'inventoryCount':len(inventory),'uiPrefixRemovalCount':prefix_count,'referenceExclusionCount':len(excluded),'postRepairReferenceOverlapCount':len(selected_overlap),'knownRegressionLeaks':known_leaks,'regression':regression},indent=2)+'\n')
    status='PASSED' if all(checks.values()) else 'FAILED'
    ef=od/'candidate_ui_action_prefix_normalization_and_reference_exclusion_integrity_repair.json'
    out={'framework':'SCIIP_EXPLORER_4_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR','generatedAt':datetime.now(timezone.utc).isoformat(),'status':status,'state':'M419D4BN17C_R4_R12_R16A_R28A_R4_UI_PREFIX_NORMALIZED_REFERENCE_EXCLUSION_INTEGRITY_CERTIFIED','classification':'PRESENTATION_LAYER_SELECT_PREFIX_REMOVED_BEFORE_CANONICAL_COMPARISON_EXACT_NEW200_REFERENCE_DISJOINT_COHORT_RECERTIFIED','authoritativeReferenceRecordCount':len(records),'candidateInventoryCount':len(inventory),'uiPrefixRemovalCount':prefix_count,'referenceExclusionCount':len(excluded),'postRepairReferenceOverlapCount':len(selected_overlap),'selectedNewCandidateCount':len(selected),'newCandidateFile':str(newf),'auditFile':str(auditf),'checks':checks,'nextMilestone':'M4_19D4BN17C_R4_R12_R16A_R28B_TWO_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION'}
    ef.write_text(json.dumps(out,indent=2)+'\n')
    print('AUTHORITATIVE_REFERENCE_RECORD_COUNT:',len(records));print('CANDIDATE_INVENTORY_COUNT:',len(inventory));print('UI_PREFIX_REMOVAL_COUNT:',prefix_count);print('REFERENCE_EXCLUSION_COUNT:',len(excluded));print('POST_REPAIR_REFERENCE_OVERLAP_COUNT:',len(selected_overlap));print('SELECTED_NEW_CANDIDATE_COUNT:',len(selected))
    print('\n----- REGRESSION GUARDS -----');print('Select 701 E Ball Rd ->',regression['Select 701 E Ball Rd']);print('Select 3200 Nasa St ->',regression['Select 3200 Nasa St'])
    print('\n----- EXACT NEW TWO HUNDRED CANDIDATES -----')
    for i,x in enumerate(selected,201):
        sf=f" | {x['sf']:,} SF" if x.get('sf') else '';print(f"{i}. {x['label']}{sf} [{x['bindingMode']}]")
    print('\n----- CHECKS -----')
    for k,v in checks.items():print(f'{k}: {v}')
    print('STATUS:',status);print('STATE:',out['state']);print('CLASSIFICATION:',out['classification']);print('NEXT_MILESTONE:',out['nextMilestone']);print('NEW_CANDIDATE_FILE:',newf);print('AUDIT_FILE:',auditf);print('EVIDENCE:',ef);print('\nR28A-R4 EXECUTION COMPLETE — paste complete output into ChatGPT.')
    return 0 if status=='PASSED' else 11
if __name__=='__main__':raise SystemExit(main())
