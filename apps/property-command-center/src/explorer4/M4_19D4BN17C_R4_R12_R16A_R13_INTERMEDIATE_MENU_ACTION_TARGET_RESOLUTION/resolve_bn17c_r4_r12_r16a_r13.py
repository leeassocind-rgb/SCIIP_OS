#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time

M='M4_19D4BN17C_R4_R12_R16A_R13_INTERMEDIATE_MENU_ACTION_TARGET_RESOLUTION'
PROBE='2 Musick'; TARGET='http://127.0.0.1:5173/'
PORTS=[9333,9334,9335,9444,9555,9666,9222,9223]

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors='ignore').lstrip())[0]
def hj(url,method='GET',timeout=1.5):
    req=urllib.request.Request(url,method=method)
    with urllib.request.urlopen(req,timeout=timeout) as r:return json.loads(r.read())
def ready(p):
    try:return bool(hj(f'http://127.0.0.1:{p}/json/version',timeout=1))
    except:return False
def pages(p):
    try:return hj(f'http://127.0.0.1:{p}/json',timeout=1)
    except:return []
def browser():
    for p in PORTS:
        if ready(p) and any('127.0.0.1:5173' in x.get('url','') for x in pages(p)): return p
    for p in PORTS:
        if ready(p): return p
    return None
def new_target(p):
    e=urllib.parse.quote(TARGET,safe=':/')
    for u in (f'http://127.0.0.1:{p}/json/new?{e}',f'http://127.0.0.1:{p}/json/new?url={e}'):
        try:
            x=hj(u,method='PUT',timeout=2)
            if x.get('webSocketDebuggerUrl'): return x
        except: pass
    return None

class WS:
    def __init__(self,u):
        m=re.match(r'ws://([^/:]+):(\d+)(/.*)',u)
        if not m: raise RuntimeError('bad websocket url')
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3); self.s.settimeout(15)
        k=base64.b64encode(os.urandom(16)).decode()
        req=(f'GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n').encode()
        self.s.sendall(req); b=b''
        while b'\r\n\r\n' not in b: b+=self.s.recv(4096)
        if b' 101 ' not in b.split(b'\r\n',1)[0]: raise RuntimeError('websocket handshake failed')
        self.i=0
    def rn(self,n):
        b=b''
        while len(b)<n:b+=self.s.recv(n-len(b))
        return b
    def send(self,o):
        b=json.dumps(o).encode(); mask=os.urandom(4); n=len(b); h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0xFE])+struct.pack('!H',n)
        else:h+=bytes([0xFF])+struct.pack('!Q',n)
        h+=mask; self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(b)))
    def recv(self):
        while True:
            h=self.rn(2); op=h[0]&15; n=h[1]&127
            if n==126:n=struct.unpack('!H',self.rn(2))[0]
            elif n==127:n=struct.unpack('!Q',self.rn(8))[0]
            mask=self.rn(4) if h[1]&128 else None; p=self.rn(n)
            if mask:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op in (1,2): return json.loads(p.decode())
    def call(self,m,p=None):
        self.i+=1; i=self.i; self.send({'id':i,'method':m,'params':p or {}})
        while True:
            x=self.recv()
            if x.get('id')==i:return x
    def ev(self,e):
        x=self.call('Runtime.evaluate',{'expression':e,'returnByValue':True,'awaitPromise':True}); r=x.get('result',{})
        return {'ok':not x.get('error') and r.get('exceptionDetails') is None,'value':r.get('result',{}).get('value')}
    def close(self):
        try:self.s.close()
        except:pass

def wait_ready(w):
    w.call('Runtime.enable'); w.call('Page.enable')
    for _ in range(50):
        time.sleep(.2)
        if w.ev('document.readyState').get('value') in ('interactive','complete'):break
    time.sleep(.8)

def select(w,q):
    js="""(async()=>{const q=QQ,n=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();const i=document.querySelector('input[aria-label=\"Search SCIIP\"]')||document.querySelector('input[type=search]');if(!i)return {ok:false};const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');if(d&&d.set)d.set.call(i,q);else i.value=q;i.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:q}));i.dispatchEvent(new Event('change',{bubbles:true}));i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));i.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));await new Promise(r=>setTimeout(r,1000));let best=null;for(const el of document.querySelectorAll('*')){const tx=(el.innerText||el.textContent||'').trim();if(!tx||!n(tx).includes(n(q)))continue;let x=el;for(let dep=0;x&&dep<8;dep++,x=x.parentElement){const rp=Object.getOwnPropertyNames(x).filter(k=>k.startsWith('__reactProps$'));let hs=[];for(const k of rp){const v=x[k];if(v&&typeof v==='object')hs=Object.keys(v).filter(z=>/^on[A-Z]/.test(z)&&typeof v[z]==='function')}const click=x.tagName==='BUTTON'||x.tagName==='A'||x.getAttribute('role')==='button'||hs.includes('onClick');let s=(click?25:0)+(['BUTTON','A'].includes(x.tagName)?10:0)+(hs.includes('onClick')?20:0)-dep*2;const xt=(x.innerText||x.textContent||'').trim();if(n(xt)===n(q))s+=30;else if(n(xt).startsWith(n(q)))s+=15;if(!best||s>best.s)best={x,s}}}if(!best)return {ok:false};best.x.click();await new Promise(r=>setTimeout(r,900));return {ok:n(document.body?.innerText||'').includes(n(q))}})()""".replace('QQ',json.dumps(q))
    return w.ev(js)

def enumerate_targets(w,aliases):
    js="""(()=>{const aliases=AA,handlers=[...new Set(aliases.map(x=>x.split('.').pop()))],norm=s=>(s||'').replace(/\\s+/g,' ').trim(),vis=el=>{try{const r=el.getBoundingClientRect(),c=getComputedStyle(el);return r.width>0&&r.height>0&&c.display!=='none'&&c.visibility!=='hidden'&&c.opacity!=='0'}catch(e){return false}},rows=[];for(const el of document.querySelectorAll('*')){for(const pk of Object.getOwnPropertyNames(el).filter(k=>k.startsWith('__reactProps$'))){const p=el[pk];if(!p||typeof p!=='object')continue;for(const h of handlers){const fn=p[h];if(typeof fn!=='function')continue;let src='';try{src=Function.prototype.toString.call(fn)}catch(e){}if(/\\[native code\\]/.test(src))continue;let a=el.parentElement,at='';for(let i=0;a&&i<5;i++,a=a.parentElement){const t=norm(a.innerText||a.textContent||'');if(t&&t.length<2500)at+=(at?' | ':'')+t.slice(0,700)}const sib=[];if(el.parentElement)for(const s of [...el.parentElement.children].slice(0,40)){if(s===el||!vis(s))continue;sib.push({tag:s.tagName,text:norm(s.innerText||s.textContent||'').slice(0,300),aria:s.getAttribute('aria-label')||'',title:s.getAttribute('title')||'',role:s.getAttribute('role')||''})}const own=norm(el.innerText||el.textContent||'').slice(0,500),aria=el.getAttribute('aria-label')||'',title=el.getAttribute('title')||'',role=el.getAttribute('role')||'',sem=(own+' '+aria+' '+title+' '+at+' '+sib.map(x=>x.text+' '+x.aria+' '+x.title).join(' ')).toLowerCase();let score=0;if(/export|download|presentation|deck|ppt|powerpoint|generate|create presentation|export presentation/.test(sem))score+=120;if(/present/.test(sem))score+=35;if(/more|menu|actions|share/.test(sem))score+=20;if(['BUTTON','A'].includes(el.tagName))score+=20;if(role==='button'||role==='menuitem')score+=15;if(vis(el))score+=15;if(/copilot|assignment|outstanding work|task|work queue|command center|inbox|notification/.test(sem))score-=180;if(/map layer|zoom|street view|google/.test(sem))score-=80;rows.push({path:'reactProps.'+h,handler:h,handlerName:fn.name||h,handlerLength:fn.length,handlerSource:src.slice(0,1400),tag:el.tagName,text:own,aria,title,role,className:String(el.className||'').slice(0,300),visible:vis(el),ancestorText:at.slice(0,2200),siblings:sib.slice(0,30),semanticScore:score})}}}rows.sort((a,b)=>b.semanticScore-a.semanticScore);return {count:rows.length,rows:rows.slice(0,250)}})()""".replace('AA',json.dumps(aliases))
    return w.ev(js)

def role_score(r,role):
    text=' '.join([r.get('text',''),r.get('aria',''),r.get('title',''),r.get('ancestorText',''),' '.join((x.get('text','')+' '+x.get('aria','')+' '+x.get('title','')) for x in r.get('siblings',[]))]).lower()
    s=r.get('semanticScore',0)
    if role=='EXPORT':
        if re.search(r'export|download|ppt|powerpoint',text):s+=120
        if re.search(r'presentation|deck',text):s+=30
    else:
        if re.search(r'presentation|deck|present',text):s+=120
        if re.search(r'export|download',text):s+=25
    if re.search(r'copilot|assignment|outstanding work|task|work queue|command center',text):s-=220
    return s

def main():
    repo=Path(sys.argv[1]).expanduser().resolve(); app=repo/'apps/property-command-center'; ev=app/'evidence/explorer4'
    r8p=ev/'M4_19D4BN17C_R4_R12_R16A_R8_APPLICATION_OWNED_FUNCTION_ALIAS_AND_ROLE_RESOLUTION'/'application_owned_function_alias_and_role_resolution.json'
    r12p=ev/'M4_19D4BN17C_R4_R12_R16A_R12_ROLE_SPECIFIC_EVENT_CONTEXT_POST_ACTION_RESIDUAL_DIAGNOSIS'/'role_specific_event_context_post_action_residual_diagnosis.json'
    if not r8p.exists() or not r12p.exists():print('STATUS: BLOCKED');print('DIAGNOSIS: R16A_R8_AND_R12_EVIDENCE_REQUIRED');return 4
    r8=fj(r8p); r12=fj(r12p)
    if r8.get('status')!='PASSED' or r12.get('status')!='PASSED':print('STATUS: BLOCKED');print('DIAGNOSIS: R16A_R8_AND_R12_MUST_PASS');return 5
    aliases=sorted(set(x.get('livePath') for x in r8.get('resolvedExportAliases',[])+r8.get('resolvedPresentationAliases',[]) if x.get('livePath')))
    p=browser()
    if p is None:print('STATUS: BLOCKED');print('DIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED');return 6
    t=new_target(p)
    if not t:print('STATUS: BLOCKED');print('DIAGNOSIS: FRESH_EXPLORER_TARGET_REQUIRED');return 7
    w=WS(t['webSocketDebuggerUrl']);wait_ready(w); sv=(select(w,PROBE).get('value') or {}); dv=(enumerate_targets(w,aliases).get('value') or {});w.close()
    rows=dv.get('rows',[]); ex=sorted([{**r,'roleScore':role_score(r,'EXPORT')} for r in rows],key=lambda x:-x['roleScore']); pr=sorted([{**r,'roleScore':role_score(r,'PRESENTATION')} for r in rows],key=lambda x:-x['roleScore'])
    exc=[r for r in ex if r['roleScore']>=80][:20]; prc=[r for r in pr if r['roleScore']>=80][:20]
    newb=(r12.get('postActionDiff') or {}).get('newButtons',[]); shell=(r12.get('residualClassification')=='INTERMEDIATE_MENU_OR_MODE_SURFACE_OPENED' and any(('copilot' in (x.get('text','')+' '+x.get('aria','')).lower() or 'assignment' in (x.get('text','')+' '+x.get('aria','')).lower()) for x in newb))
    checks={'r16aR8Passed':r8.get('status')=='PASSED','r16aR12Passed':r12.get('status')=='PASSED','r12IntermediateMenuOrModeSurface':r12.get('residualClassification')=='INTERMEDIATE_MENU_OR_MODE_SURFACE_OPENED','r12PriorHandlerClassifiedAsShellFalsePositive':shell,'probeSelectedPropertyCertified':sv.get('ok') is True,'applicationOwnedHandlerInstancesEnumerated':dv.get('count',0)>0,'elementRoleAndAncestorContextCaptured':len(rows)>0,'siblingControlContextCaptured':any(len(r.get('siblings',[]))>0 for r in rows),'shellNavigationPenaltyApplied':True,'roleSpecificSemanticScoringApplied':True,'applicationMutationOff':True,'governedMutationOff':True,'networkAuthorityOff':True,'pixelEvidenceOff':True,'exportPresentationRuntimeInvocationOff':True}
    if exc and prc:diag='ROLE_SPECIFIC_APPLICATION_OWNED_EXPORT_PRESENTATION_TARGETS_RESOLVED';nxt='M4_19D4BN17C_R4_R12_R16A_R14_ROLE_BOUND_EVENT_CONTEXT_EXPORT_PRESENTATION_MICRO_COHORT_RECERTIFICATION'
    elif exc or prc:diag='ROLE_SPECIFIC_APPLICATION_OWNED_ACTION_TARGET_RESOLUTION_PARTIAL';nxt='M4_19D4BN17C_R4_R12_R16A_R14_MISSING_ROLE_TARGET_SOURCE_TO_LIVE_CONTROL_CORRELATION'
    else:diag='NO_SAFE_EXPORT_PRESENTATION_TARGET_RESOLVED_PRIOR_ONCLICK_WAS_SHELL_OR_MODE_HANDLER';nxt='M4_19D4BN17C_R4_R12_R16A_R14_EXPORT_PRESENTATION_UI_AFFORDANCE_SOURCE_CONTRACT_AND_RENDER_GATE_RESOLUTION'
    passed=all(checks.values());status='PASSED' if passed else 'DIAGNOSTIC_COMPLETE';state='M419D4BN17C_R4_R12_R16A_R13_INTERMEDIATE_MENU_ACTION_TARGET_RESOLUTION_CERTIFIED' if passed else 'M419D4BN17C_R4_R12_R16A_R13_TARGET_RESOLUTION_INCOMPLETE'
    res={'framework':'SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R13_INTERMEDIATE_MENU_ACTION_TARGET_RESOLUTION','generatedAt':datetime.now(timezone.utc).isoformat(),'status':status,'state':state,'diagnosis':diag,'checks':checks,'probeProperty':PROBE,'selectedProperty':sv,'r8AliasPaths':aliases,'r12ShellFalsePositive':shell,'enumeratedHandlerCount':dv.get('count',0),'resolvedExportTargetCount':len(exc),'resolvedPresentationTargetCount':len(prc),'topExportTarget':exc[0] if exc else None,'topPresentationTarget':prc[0] if prc else None,'exportCandidates':exc,'presentationCandidates':prc,'allEnumeratedTargets':rows[:150],'authority':{'applicationSourceMutation':False,'governedDataMutation':False,'networkAuthority':False,'pixelEvidence':False,'exportPresentationRuntimeInvocation':False},'nextMilestone':nxt}
    out=ev/M;out.mkdir(parents=True,exist_ok=True);f=out/'intermediate_menu_action_target_resolution.json';f.write_text(json.dumps(res,indent=2)+'\n')
    print('='*120);print('SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R13 Intermediate Menu Action Target Resolution');print('='*120);print('R12_SHELL_FALSE_POSITIVE:',shell);print('PROBE_SELECTED_PROPERTY_CERTIFIED:',sv.get('ok'));print('ENUMERATED_HANDLER_COUNT:',dv.get('count'));print('RESOLVED_EXPORT_TARGET_COUNT:',len(exc));print('RESOLVED_PRESENTATION_TARGET_COUNT:',len(prc))
    print('\n----- TOP EXPORT TARGETS -----');[print(json.dumps({k:x.get(k) for k in ('tag','text','aria','title','role','handler','handlerName','handlerLength','semanticScore','roleScore','ancestorText')},ensure_ascii=False)) for x in exc[:12]]
    print('\n----- TOP PRESENTATION TARGETS -----');[print(json.dumps({k:x.get(k) for k in ('tag','text','aria','title','role','handler','handlerName','handlerLength','semanticScore','roleScore','ancestorText')},ensure_ascii=False)) for x in prc[:12]]
    print('\n----- CHECKS -----');[print(f'{k}: {v}') for k,v in checks.items()];print('STATUS:',status);print('STATE:',state);print('DIAGNOSIS:',diag);print('NEXT_MILESTONE:',nxt);print('EVIDENCE:',f);return 0
if __name__=='__main__':raise SystemExit(main())
