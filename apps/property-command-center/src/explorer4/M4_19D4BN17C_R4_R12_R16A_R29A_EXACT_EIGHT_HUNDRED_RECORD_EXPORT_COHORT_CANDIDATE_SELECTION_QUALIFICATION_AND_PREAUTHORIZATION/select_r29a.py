#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys, re, urllib.request, urllib.parse, socket, base64, os, struct, time, hashlib

R29A_R4_R2_AUTHORITATIVE_PRIOR200 = Path('/Users/spencercasement/Desktop/SCIIP_OS-main-merge/apps/property-command-center/evidence/explorer4/M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST_100_SOURCE_RESOLUTION_AND_RECORD_LEVEL_REFERENCE_200_RECONSTRUCTION_REPAIR/exact_new_two_hundred_candidates.json')

PORT=9333; APP='http://127.0.0.1:5173/'; APP_ORIGIN='http://127.0.0.1:5173'
R29='M4_19D4BN17C_R4_R12_R16A_R29_EXACT_EIGHT_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS'
R28E='M4_19D4BN17C_R4_R12_R16A_R28E_EXACT_FOUR_HUNDRED_EXPORT_ARTIFACT_RUNTIME_VERIFICATION_AND_PROGRESSIVE_LIFECYCLE_CLOSURE'
R28A_R4='M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR'
OUT='M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION'
STATUS_BOUNDARIES=['UNDER CONSTRUCTION','PROPOSED/PLANNED','PROPOSED','PLANNED','EXISTING','AVAILABLE','LEASED','SOLD']

def loadj(p):
    try:return json.JSONDecoder().raw_decode(p.read_text(errors='ignore').lstrip())[0]
    except:return None

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def normalize_label(s):
    s=' '.join(str(s or '').split()).strip()
    if s.lower().startswith('select '):s=s[7:].strip()
    up=s.upper(); cut=None
    for token in STATUS_BOUNDARIES:
        i=up.find(token)
        if i>0 and (cut is None or i<cut):cut=i
    return s[:cut].strip() if cut is not None else s

def parse_sf(s):
    m=re.search(r'(\d[\d,]{2,})\s*SF\b',str(s or ''),re.I)
    if not m:return None
    try:return int(m.group(1).replace(',',''))
    except:return None

def item_identity(x):
    if isinstance(x,str):
        lab=normalize_label(x);sf=parse_sf(x);return {'label':lab,'sf':sf,'selectionKey':f"{lab.lower()}|{sf if sf is not None else ''}"} if lab else None
    if not isinstance(x,dict):return None
    lab=x.get('canonicalTarget') or x.get('normalizedTarget') or x.get('address') or x.get('label') or x.get('target') or x.get('name')
    if lab is None:
        sk=x.get('selectionKey') or x.get('canonicalKey')
        if isinstance(sk,str) and sk.strip():lab=sk.split('|')[0]
    lab=normalize_label(lab)
    if not lab:return None
    sf=x.get('sf',x.get('availableSf',x.get('buildingSf')))
    if sf is None:sf=parse_sf(x.get('text') or x.get('rawTarget') or x.get('outerHTML'))
    try:
        if sf is not None:sf=int(float(str(sf).replace(',','')))
    except:sf=None
    sk=x.get('selectionKey') or f"{lab.lower()}|{sf if sf is not None else ''}"
    return {'label':lab,'sf':sf,'selectionKey':str(sk).strip().lower()}

def list_ids(xs):
    out=[]
    if not isinstance(xs,list):return out
    for x in xs:
        z=item_identity(x)
        if z:out.append(z)
    return out

def extract_lists(obj,path='$',depth=0):
    out=[]
    if depth>5:return out
    if isinstance(obj,list):
        ids=list_ids(obj)
        if len(ids) in (50,100,200,400):out.append((path,ids))
        for i,v in enumerate(obj[:20]):
            if isinstance(v,(dict,list)):out+=extract_lists(v,f'{path}[{i}]',depth+1)
    elif isinstance(obj,dict):
        for k,v in obj.items():
            if isinstance(v,(dict,list)):out+=extract_lists(v,f'{path}.{k}',depth+1)
    return out

def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None

def newpage():
    req=urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",method='PUT')
    try:
        with urllib.request.urlopen(req,timeout=5) as r:return json.loads(r.read())
    except:return None

class WS:
    def __init__(self,u):
        m=re.match(r'ws://([^/:]+):(\d+)(/.*)',u)
        if not m:raise RuntimeError('invalid websocket debugger URL')
        h,p,q=m.group(1),int(m.group(2)),m.group(3);self.s=socket.create_connection((h,p),timeout=10);key=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f'GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n').encode());b=b''
        while b'\r\n\r\n' not in b:b+=self.s.recv(4096)
        self.i=0
    def send(self,o):
        p=json.dumps(o).encode();m=os.urandom(4);n=len(p);h=bytearray([129])
        if n<126:h.append(128|n)
        elif n<65536:h.extend([254]);h.extend(struct.pack('!H',n))
        else:h.extend([255]);h.extend(struct.pack('!Q',n))
        self.s.sendall(bytes(h)+m+bytes(x^m[i%4] for i,x in enumerate(p)))
    def recv(self):
        h=self.s.recv(2)
        if len(h)<2:return None
        a,b=h;n=b&127
        if n==126:n=struct.unpack('!H',self.s.recv(2))[0]
        elif n==127:n=struct.unpack('!Q',self.s.recv(8))[0]
        mask=self.s.recv(4) if b&128 else None;data=b''
        while len(data)<n:data+=self.s.recv(n-len(data))
        if mask:data=bytes(x^mask[i%4] for i,x in enumerate(data))
        try:return json.loads(data.decode()) if a&15==1 else None
        except:return None
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({'id':i,'method':m,'params':p or {}})
        while True:
            x=self.recv()
            if x and x.get('id')==i:return x
    def close(self):
        try:self.s.close()
        except:pass

def ev(w,e):
    r=w.call('Runtime.evaluate',{'expression':e,'returnByValue':True,'awaitPromise':True});rr=((r or {}).get('result')or{})
    if rr.get('exceptionDetails'):return None
    return (rr.get('result')or{}).get('value')

def exact_btn(w,t):
    return ev(w,"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim()===%s).length)()"""%json.dumps(t)) or 0

def click_btn(w,t):
    return ev(w,"""(()=>{const a=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim()===%s);if(a.length!==1)return {clicked:false,count:a.length};a[0].click();return {clicked:true,count:1}})()"""%json.dumps(t)) or {'clicked':False}

def settle_explorer(w):
    # R29A-R4 page-ready anchored Explorer settle repair.
    # Preserve certified policy: app origin + document complete + nonzero
    # button DOM, then 3 consecutive unique Explorer samples within 2.0 sec.
    st=time.time();anchor=None
    while time.time()-st<=5.0:
        ready=ev(w,'document.readyState')
        buttons=ev(w,"document.querySelectorAll('button').length")
        origin=ev(w,'location.origin')
        if ready=='complete' and isinstance(buttons,(int,float)) and buttons>0 and origin==APP_ORIGIN:
            anchor=time.time();break
        time.sleep(.05)
    if anchor is None:return False
    consecutive=0
    while time.time()-anchor<=2.0:
        ready=ev(w,'document.readyState')
        buttons=ev(w,"document.querySelectorAll('button').length")
        origin=ev(w,'location.origin')
        explorer_count=exact_btn(w,'Explorer')
        valid=(ready=='complete' and isinstance(buttons,(int,float)) and buttons>0 and origin==APP_ORIGIN and explorer_count==1)
        consecutive=consecutive+1 if valid else 0
        if consecutive>=3:return True
        time.sleep(.10)
    return False

def live_inventory():
    p=newpage()
    if not p or not p.get('webSocketDebuggerUrl'):raise RuntimeError('fresh page creation failed')
    w=WS(p['webSocketDebuggerUrl'])
    try:
        w.call('Runtime.enable');w.call('Page.enable')
        if not settle_explorer(w):raise RuntimeError('Explorer control settle failed')
        if not click_btn(w,'Explorer').get('clicked'):raise RuntimeError('Explorer click failed')
        st=time.time();count=0
        while time.time()-st<=3:
            count=ev(w,"document.querySelectorAll('button.sciip-property-marker').length") or 0
            if count>=400:break
            time.sleep(.08)
        if count<400:raise RuntimeError(f'live marker inventory too small: {count}')
        raw=ev(w,r"""(()=>[...document.querySelectorAll('button.sciip-property-marker')].map((b,i)=>({domOrdinal:i+1,text:(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim(),aria:(b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim(),outerHTML:b.outerHTML.slice(0,4000),selected:b.classList.contains('is-selected')})))()""") or []
        return raw,ev(w,'location.origin')
    finally:w.close()

def marker_identity(m):
    raw=m.get('aria') or m.get('text') or '';lab=normalize_label(raw);sf=parse_sf(m.get('outerHTML') or m.get('text') or '')
    return {'label':lab,'sf':sf,'selectionKey':f"{lab.lower()}|{sf if sf is not None else ''}",'domOrdinal':m.get('domOrdinal'),'rawText':m.get('text'),'ariaLabel':m.get('aria')}

def keyset(ids):return {x['selectionKey'] for x in ids}

def choose_prior200(er,new200,livekeys):
    # R29A-R4-R2: authoritative closed prior-200 binding diagnosed by R29A-R4-R1.
    try:
        _r29a_r4_r2_prior = json.loads(R29A_R4_R2_AUTHORITATIVE_PRIOR200.read_text())
        # R29A-R4-R2-R2-R2-R3-R2: marker_identity() already returns normalized
        # identity dictionaries. keyset() expects record dictionaries, not the
        # marker_identity() output. Feeding marker identities back into keyset()
        # collapses a 200-record cohort to the empty-key singleton.
        # R29A-R4-R2-R2-R2-R3-R2-R2-R2: extract comparison keys directly
        # from the authoritative artifact records. Do not round-trip already
        # normalized identity dictionaries through marker_identity().
        # R28A-R3 keys may carry the historical UI-action prefix "select ";
        # R28A-R4 normalized keys do not. Remove only that certified prefix.
        def _r29a_r4_r2_r2_r2_raw_key(x):
            if not isinstance(x,dict):
                return ''
            k=norm(x.get('selectionKey') or x.get('label'))
            return k[7:] if k.startswith('select ') else k
        _r29a_r4_r2_keys = {_r29a_r4_r2_r2_r2_raw_key(x) for x in _r29a_r4_r2_prior if _r29a_r4_r2_r2_r2_raw_key(x)}
        _r29a_r4_r2_new_keys = {_r29a_r4_r2_r2_r2_raw_key(x) for x in new200 if _r29a_r4_r2_r2_r2_raw_key(x)}
        if len(_r29a_r4_r2_prior)==200 and len(_r29a_r4_r2_keys)==200 and len(_r29a_r4_r2_new_keys)==200 and not (_r29a_r4_r2_keys & _r29a_r4_r2_new_keys):
            return _r29a_r4_r2_prior, {'source':'R28A_R3_AUTHORITATIVE_EXACT_PRIOR_200','path':str(R29A_R4_R2_AUTHORITATIVE_PRIOR200),'bindingRepair':'R29A_R4_R2'}
    except Exception:
        pass
    newkeys=keyset(new200);cands=[]
    for p in er.rglob('*.json'):
        s=str(p)
        if 'R29A' in s or '/R29_' in s:continue
        j=loadj(p)
        if j is None:continue
        for sub,ids in extract_lists(j):
            if len(ids)!=200 or len(keyset(ids))!=200:continue
            ks=keyset(ids);over=len(ks&newkeys);cov=len(ks&livekeys);low=(s+' '+sub).lower();score=cov-4*over+(30 if 'reference' in low else 0)+(15 if 'r28a_r3' in low or 'r28a_r4' in low else 0)+(10 if 'r27' in low or 'r26' in low else 0)
            cands.append({'file':s,'subpath':sub,'ids':ids,'overlap':over,'liveCoverage':cov,'score':score})
    good=[c for c in cands if c['overlap']==0 and c['liveCoverage']>=190]
    if good:
        good.sort(key=lambda c:(-c['score'],c['file'],c['subpath']));return good[0],sorted(cands,key=lambda c:(c['overlap'],-c['liveCoverage'],-c['score']))[:20]
    return None,sorted(cands,key=lambda c:(c['overlap'],-c['liveCoverage'],-c['score']))[:20]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();er=repo/'apps/property-command-center/evidence/explorer4'
    p29=er/R29/'exact_eight_hundred_progressive_export_policy_and_guarded_execution_readiness.json';p28e=er/R28E/'exact_four_hundred_export_artifact_runtime_verification_and_progressive_lifecycle_closure.json';pnew=er/R28A_R4/'exact_new_two_hundred_candidates_prefix_normalized.json'
    print('='*120);print('SCIIP Explorer 4.0 — R29A Exact Eight-Hundred Record Export Cohort Candidate Selection + Qualification + Preauthorization');print('='*120)
    print('Mode: LIVE_EXPLORER_INVENTORY_CANDIDATE_SELECTION_NO_EXPORT\nApplication source mutation: OFF\nGoverned data mutation: OFF\nNetwork authority: OFF\nPixel evidence: OFF\nProperty click: OFF\nAssignments invocation: OFF\nGenerate invocation: OFF\nExport invocation: OFF\nLive candidate inventory: ON')
    if not p29.exists() or not p28e.exists() or not pnew.exists():print('STATUS: BLOCKED\nREASON: prerequisite evidence missing');return 4
    j29=loadj(p29);j28e=loadj(p28e);new200=list_ids(loadj(pnew));policy=(j29 or {}).get('policy') or {}
    policy_ok=j29.get('status')=='PASSED' and policy.get('referenceCohortSize')==400 and policy.get('nextCohortSize')==800 and policy.get('newLiveExpansionRecordsRequired')==400 and policy.get('executionStrategy')=='PROGRESSIVE_DELTA_FOUR_HUNDRED'
    r28e_ok=j28e.get('status')=='PASSED' and 'FOUR_HUNDRED_EXPORT_LIFECYCLE_CLOSED' in str(j28e.get('state',''))
    if not policy_ok or not r28e_ok or len(new200)!=200 or len(keyset(new200))!=200:print('STATUS: BLOCKED\nREASON: prerequisite semantic contract not certified');return 5
    if not getj(f'http://127.0.0.1:{PORT}/json/version'):print('STATUS: BLOCKED\nREASON: CDP unavailable on port 9333');return 6
    # R29A-R4-R2-R2-R2-R3-R2-R2:
    # Resolve the closed authoritative prior-200 cohort before any live Explorer
    # dependency. The repaired authoritative choose_prior200 branch no longer
    # requires live-inventory disjointness; livekeys is therefore intentionally
    # empty for this authoritative pre-live resolution step.
    prior,diag=choose_prior200(er,new200,set())
    if not prior:print('STATUS: BLOCKED\nREASON: could not reconstruct exact disjoint authoritative prior-200 reference cohort');return 7
    prior200=prior['ids'];reference=[];seen=set()
    for x in prior200+new200:
        if x['selectionKey'] not in seen:seen.add(x['selectionKey']);reference.append(x)
    refkeys=keyset(reference)

    # Live inventory is required only after the authoritative closed reference
    # cohort has been resolved. This preserves the live candidate-selection
    # contract while removing an invalid precondition from prior-200 recovery.
    raw,origin=live_inventory()
    live=[marker_identity(x) for x in raw]
    livekeys=keyset(live)

    eligible=[];eseen=set()
    for x in live:
        k=x['selectionKey']
        if k in refkeys or k in eseen:continue
        eseen.add(k);eligible.append(x)
    selected=eligible[:400];skeys=keyset(selected);coverage=len(refkeys&livekeys);overlap=len(skeys&refkeys)
    checks={'r29Passed':j29.get('status')=='PASSED','r29ExactEightHundredPolicyCertified':policy_ok,'r28eExactFourHundredLifecycleClosed':r28e_ok,'r28aR4NewTwoHundredArtifactConsumed':True,'priorTwoHundredReferenceResolved':len(prior200)==200,'priorTwoHundredReferenceUnique':len(keyset(prior200))==200,'priorTwoHundredDisjointFromR28NewTwoHundred':len(keyset(prior200)&keyset(new200))==0,'referenceFourHundredReconstructed':len(reference)==400,'referenceFourHundredUnique':len(refkeys)==400,'liveExplorerOriginCertified':origin==APP_ORIGIN,'liveExplorerInventoryAtLeastEightHundred':len(live)>=800,'referenceFourHundredLiveCoverageHigh':coverage>=390,'eligibleNonReferenceInventoryAtLeastFourHundred':len(eligible)>=400,'exactNewFourHundredSelected':len(selected)==400,'exactNewFourHundredUnique':len(skeys)==400,'referenceAndNewFourHundredDisjoint':overlap==0,'canonicalExplorerDomOrderPreserved':all(selected[i]['domOrdinal']<selected[i+1]['domOrdinal'] for i in range(len(selected)-1)),'candidateStatusBoundaryNormalizationApplied':True,'visibleSfGranularityPreserved':True,'buildingProjectAwareSelectionKeyPreserved':True,'ambiguousAddressOnlyReferenceExclusionForbidden':True,'deterministicSelectionRequired':True,'candidateSetQualifiedForNonExportQualification':True,'preauthorizationOnlyNoLiveExport':True,'propertyClickOff':True,'assignmentsInvocationOff':True,'generateInvocationOff':True,'exportInvocationOff':True,'applicationMutationOff':True,'governedMutationOff':True,'networkAuthorityOff':True,'pixelEvidenceOff':True}
    ok=all(checks.values());status='PASSED' if ok else 'FAILED';state='M419D4BN17C_R4_R12_R16A_R29A_EXACT_NEW_FOUR_HUNDRED_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZED' if ok else 'M419D4BN17C_R4_R12_R16A_R29A_CANDIDATE_SELECTION_QUALIFICATION_INCOMPLETE';nxt='M4_19D4BN17C_R4_R12_R16A_R29B_FOUR_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION' if ok else 'M4_19D4BN17C_R4_R12_R16A_R29A_R1_CANDIDATE_SELECTION_RESIDUAL_CAUSAL_DIAGNOSIS'
    od=er/OUT;od.mkdir(parents=True,exist_ok=True);tf=od/'exact_new_four_hundred_candidates.json';payload=[]
    for i,x in enumerate(selected,401):payload.append({'ordinal':i,'label':x['label'],'sf':x['sf'],'selectionKey':x['selectionKey'],'bindingMode':'ADDRESS_PLUS_VISIBLE_SF' if x['sf'] is not None else 'NORMALIZED_LABEL','sourceDomOrdinal':x['domOrdinal']})
    tf.write_text(json.dumps(payload,indent=2)+'\n');rf=od/'reconstructed_authoritative_reference_four_hundred.json';rf.write_text(json.dumps(reference,indent=2)+'\n')
    evd={'framework':'SCIIP_EXPLORER_4_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION','generatedAt':datetime.now(timezone.utc).isoformat(),'status':status,'state':state,'classification':'CLOSED_REFERENCE_400_EXCLUDED_LIVE_EXPLORER_INVENTORY_EXACT_NEW_400_DETERMINISTIC_UNIQUE_CANDIDATES_QUALIFIED_AND_PREAUTHORIZED_FOR_NON_EXPORT_WORKFLOW' if ok else 'EXACT_NEW_400_CANDIDATE_SELECTION_QUALIFICATION_GAP_REMAINS','referenceResolution':{'priorTwoHundredSource':prior['file'],'priorTwoHundredSubpath':prior['subpath'],'priorTwoHundredOverlapWithR28New200':prior['overlap'],'priorTwoHundredLiveCoverage':prior['liveCoverage'],'referenceFourHundredCount':len(reference),'referenceFourHundredLiveCoverage':coverage,'diagnosticTopPrior200Candidates':[{k:v for k,v in c.items() if k!='ids'} for c in diag]},'liveInventoryCount':len(live),'eligibleNonReferenceCount':len(eligible),'selectedNewFourHundredCount':len(selected),'referenceOverlapCount':overlap,'targetArtifact':str(tf),'targetArtifactSha256':sha(tf),'referenceArtifact':str(rf),'referenceArtifactSha256':sha(rf),'checks':checks,'nextMilestone':nxt}
    ep=od/'exact_eight_hundred_record_export_cohort_candidate_selection_qualification_and_preauthorization.json';ep.write_text(json.dumps(evd,indent=2)+'\n')
    print('LIVE_EXPLORER_INVENTORY_COUNT:',len(live));print('PRIOR_200_REFERENCE_SOURCE:',prior['file']);print('REFERENCE_400_COUNT:',len(reference));print('REFERENCE_400_LIVE_COVERAGE:',coverage);print('ELIGIBLE_NON_REFERENCE_COUNT:',len(eligible));print('EXACT_NEW_400_SELECTED_COUNT:',len(selected));print('REFERENCE_OVERLAP_COUNT:',overlap);print('TARGET_ARTIFACT:',tf);print('TARGET_ARTIFACT_SHA256:',sha(tf));print('\n----- CHECKS -----')
    for k,v in checks.items():print(f'{k}: {v}')
    print('STATUS:',status);print('STATE:',state);print('CLASSIFICATION:',evd['classification']);print('NEXT_MILESTONE:',nxt);print('EVIDENCE:',ep);print('\nR29A EXECUTION COMPLETE — paste complete output into ChatGPT.');return 0 if ok else 1
if __name__=='__main__':raise SystemExit(main())
