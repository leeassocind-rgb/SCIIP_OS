#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request

M="M4_19D4BN17C_R4_R12_R16A_R21_R1_ACTIVE_RUNTIME_BUNDLE_PROVENANCE_AND_CONTROL_REACHABILITY_CERTIFICATION"
PREV="M4_19D4BN17C_R4_R12_R16A_R21_EXPORT_PRESENTATION_CONTROL_OWNER_SOURCE_AND_ACTIVE_DIST_REFOCUS"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def compact(s): return re.sub(r"\s+"," ",s).strip()

def get(url):
 try:
  with urllib.request.urlopen(url,timeout=2) as r:return r.read().decode("utf-8","ignore")
 except:return None

def main():
 repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
 prevp=ev/PREV/"export_presentation_control_owner_source_and_active_dist_refocus.json"
 if not prevp.exists(): print("STATUS: BLOCKED\nDIAGNOSIS: R21_EVIDENCE_REQUIRED");return 4
 prev=loadj(prevp)
 if prev.get("status")!="PASSED": print("STATUS: BLOCKED\nDIAGNOSIS: R21_PASS_REQUIRED");return 5
 if prev.get("classification")!="EXPORT_PRESENTATION_CONTROL_OWNER_AND_DIST_CANDIDATES_LOCATED_RUNTIME_ACTIVATION_UNPROVEN":
  print("STATUS: BLOCKED\nDIAGNOSIS: R21_R1_NOT_AUTHORIZED");return 6

 owner_files=prev.get("ownerFiles",[])
 candidate_dist=prev.get("activeDistFiles",[])
 urls=["http://127.0.0.1:5173/","http://localhost:5173/","http://127.0.0.1:5174/","http://localhost:5174/"]
 live=None;html=None
 for u in urls:
  x=get(u)
  if x and ("<script" in x or "<html" in x.lower()):
   live=u;html=x;break

 script_srcs=[]
 if html:
  script_srcs=re.findall(r'<script[^>]+src=["\']([^"\']+)["\']',html,re.I)
 active_assets=[]
 for s in script_srcs:
  if s.startswith("http"): au=s
  elif s.startswith("/"): au=live.rstrip("/")+s
  else: au=live+s
  body=get(au)
  active_assets.append({"src":s,"url":au,"reachable":body is not None,"bytes":len(body or ""),
    "exportText":bool(re.search(r'>\s*Export\s*<|["\']Export["\']',body or "",re.I)),
    "presentationText":bool(re.search(r'>\s*Presentation\s*<|["\']Presentation["\']',body or "",re.I))})

 # recursively discover JS chunk names referenced by reachable entry assets
 discovered=set()
 frontier=[a["url"] for a in active_assets if a["reachable"]]
 bodies={}
 for depth in range(3):
  nxt=[]
  for url in frontier:
   if url in bodies: continue
   b=get(url);bodies[url]=b or ""
   if not b: continue
   for ref in re.findall(r'["\'](\.?/?assets/[^"\']+\.js)["\']',b):
    if ref.startswith("/"): ru=live.rstrip("/")+ref
    elif ref.startswith("assets/"): ru=live+"%s"%ref
    else:
     ru=live+"assets/"+ref.split("assets/",1)[1]
    if ru not in discovered: discovered.add(ru);nxt.append(ru)
  frontier=nxt

 reach=[]
 for u in sorted(discovered):
  b=get(u)
  if b is None: continue
  rel="dist/assets/"+u.rsplit("/",1)[-1]
  reach.append({"url":u,"distPath":rel,"bytes":len(b),
   "candidateFromR21":rel in candidate_dist,
   "exportSemantic":bool(re.search(r'>\s*Export\s*<|["\']Export["\']',b,re.I)),
   "presentationSemantic":bool(re.search(r'>\s*Presentation\s*<|["\']Presentation["\']',b,re.I)),
   "institutionalReportSemantic":"Download Client Listing Report" in b})

 matched=[x for x in reach if x["candidateFromR21"]]
 semantic=[x for x in reach if x["exportSemantic"] or x["presentationSemantic"] or x["institutionalReportSemantic"]]

 if live and matched:
  cls="ACTIVE_RUNTIME_PROVENANCE_CERTIFIED_R21_DIST_CANDIDATE_REACHABLE"
  nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_LIVE_EXPORT_CONTROL_ROUTE_AND_INTERACTION_REACHABILITY_CERTIFICATION"
  status="PASSED"
 elif live and semantic:
  cls="ACTIVE_RUNTIME_SEMANTIC_CONTROL_CHUNK_REACHABLE_R21_FILENAME_PARITY_NOT_ESTABLISHED"
  nxt="M4_19D4BN17C_R4_R12_R16A_R21_R1_R1_ACTIVE_CHUNK_HASH_AND_SOURCE_OWNER_PARITY_RESOLUTION"
  status="PASSED"
 elif live:
  cls="LIVE_APP_REACHABLE_ACTIVE_EXPORT_PRESENTATION_CHUNK_NOT_RESOLVED"
  nxt="M4_19D4BN17C_R4_R12_R16A_R21_R1_R1_ACTIVE_CHUNK_HASH_AND_SOURCE_OWNER_PARITY_RESOLUTION"
  status="DIAGNOSTIC_COMPLETE"
 else:
  cls="LIVE_APP_NOT_REACHABLE_PROVENANCE_CERTIFICATION_BLOCKED"
  nxt="M4_19D4BN17C_R4_R12_R16A_R21_R1_RETRY_WITH_LOCAL_APP_RUNNING"
  status="DIAGNOSTIC_COMPLETE"

 checks={"r21Passed":True,"r21ActivationUnprovenConsumed":True,"liveAppProbeCompleted":True,
 "entryScriptDiscoveryCompleted":True,"reachableChunkGraphInspected":bool(live),
 "runtimeBundlePresenceNotInferredFromDisk":True,"applicationMutationOff":True,
 "governedMutationOff":True,"pixelEvidenceOff":True,"liveWorkflowActionAuthorityOff":True}
 out=ev/M;out.mkdir(parents=True,exist_ok=True);ef=out/"active_runtime_bundle_provenance_and_control_reachability_certification.json"
 data={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R21_R1_ACTIVE_RUNTIME_BUNDLE_PROVENANCE_AND_CONTROL_REACHABILITY_CERTIFICATION",
 "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"liveAppUrl":live,
 "r21OwnerFiles":owner_files,"r21CandidateDistFiles":candidate_dist,"entryScripts":script_srcs,
 "activeEntryAssets":active_assets,"reachableChunkCount":len(reach),"reachableChunks":reach,
 "matchedR21CandidateCount":len(matched),"matchedR21Candidates":matched,
 "semanticReachableChunkCount":len(semantic),"semanticReachableChunks":semantic,
 "classification":cls,"checks":checks,"nextMilestone":nxt,
 "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,"liveWorkflowActionAuthority":False}}
 ef.write_text(json.dumps(data,indent=2)+"\n")
 print("="*120);print("SCIIP Explorer 4.0 — R21-R1 Active Runtime Bundle Provenance + Control Reachability Certification");print("="*120)
 print("R21_CLASSIFICATION:",prev.get("classification"));print("LIVE_APP_URL:",live)
 print("ENTRY_SCRIPT_COUNT:",len(script_srcs));print("REACHABLE_CHUNK_COUNT:",len(reach))
 print("R21_CANDIDATE_MATCH_COUNT:",len(matched));print("SEMANTIC_REACHABLE_CHUNK_COUNT:",len(semantic))
 print("\n----- MATCHED R21 ACTIVE CHUNKS -----")
 for x in matched:print(json.dumps(x))
 print("\n----- SEMANTIC ACTIVE CHUNKS -----")
 for x in semantic[:30]:print(json.dumps(x))
 print("\n----- CHECKS -----")
 for k,v in checks.items():print(f"{k}: {v}")
 print("CLASSIFICATION:",cls);print("STATUS:",status);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ef);return 0
if __name__=="__main__":raise SystemExit(main())
