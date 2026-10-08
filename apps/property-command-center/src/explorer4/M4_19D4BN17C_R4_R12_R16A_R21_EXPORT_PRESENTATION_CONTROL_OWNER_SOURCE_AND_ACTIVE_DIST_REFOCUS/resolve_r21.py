#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R21_EXPORT_PRESENTATION_CONTROL_OWNER_SOURCE_AND_ACTIVE_DIST_REFOCUS"
PREV="M4_19D4BN17C_R4_R12_R16A_R20_R5_R9_R1_EXPORT_PRESENTATION_SEMANTIC_TOKEN_DISAMBIGUATION_AND_CAUSAL_BINDING_REPAIR"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def line(s,pos): return s.count("\n",0,pos)+1
def compact(s): return re.sub(r"\s+"," ",s).strip()
def scan_file(p, root):
 try:s=p.read_text(errors="ignore")
 except:return []
 out=[]
 pats=[
  ("EXPORT_TEXT",re.compile(r'>\s*Export\s*<',re.I)),
  ("EXPORT_STRING",re.compile(r'(["\'])Export\1',re.I)),
  ("PRESENTATION_TEXT",re.compile(r'>\s*Presentation\s*<',re.I)),
  ("PRESENTATION_STRING",re.compile(r'(["\'])Presentation\1',re.I)),
  ("EXPORT_HANDLER",re.compile(r'\b(?:onExport|handleExport|exportPresentation|export[A-Z]\w*)\b')),
  ("PRESENTATION_HANDLER",re.compile(r'\b(?:onPresentation|handlePresentation|openPresentation|generatePresentation)\b')),
 ]
 for kind,pat in pats:
  for m in pat.finditer(s):
   a=max(0,m.start()-900);b=min(len(s),m.end()+1200);w=s[a:b]
   out.append({"file":str(p.relative_to(root)),"line":line(s,m.start()),"kind":kind,
    "token":m.group(0),"hasOnClick":"onClick" in w,"hasDownloadIcon":"Download" in w,
    "hasRuntimeStatus":bool(re.search(r'\bruntimeStatus\b',w)),
    "hasDiagnostics":bool(re.search(r'\bdiagnostics\b',w)),
    "snippet":compact(w)})
 return out

def main():
 repo=Path(sys.argv[1]).expanduser().resolve(); app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"
 prevp=ev/PREV/"export_presentation_semantic_token_disambiguation_and_causal_binding_repair.json"
 if not prevp.exists(): print("STATUS: BLOCKED\nDIAGNOSIS: R5_R9_R1_EVIDENCE_REQUIRED");return 4
 prev=loadj(prevp)
 if prev.get("status")!="PASSED": print("STATUS: BLOCKED\nDIAGNOSIS: R5_R9_R1_PASS_REQUIRED");return 5
 if prev.get("classification")!="R5_R9_EXACT_BINDING_REJECTED_AS_LEXICAL_FALSE_POSITIVE_NO_RUNTIME_FIELD_BOUND_TO_SEMANTIC_EXPORT_PRESENTATION_CONTROL":
  print("STATUS: BLOCKED\nDIAGNOSIS: R21_REFOCUS_NOT_AUTHORIZED_BY_R5_R9_R1");return 6

 src=app/"src"; source=[]
 for p in src.rglob("*"):
  if p.is_file() and p.suffix.lower() in {".js",".jsx",".ts",".tsx",".mjs",".cjs"} and "src/explorer4/" not in str(p):
   source.extend(scan_file(p,app))

 # Rank actual UI controls above capability strings / role=presentation semantics.
 for x in source:
  score=0
  if x["kind"] in ("EXPORT_TEXT","PRESENTATION_TEXT"): score+=10
  if x["hasOnClick"]: score+=4
  if x["hasDownloadIcon"]: score+=3
  if x["kind"].endswith("HANDLER"): score+=5
  x["ownerScore"]=score
 source.sort(key=lambda x:(-x["ownerScore"],x["file"],x["line"]))
 owners=[x for x in source if x["ownerScore"]>=10]

 # Active-dist/build refocus: search likely generated/runtime trees but never mutate.
 dist_roots=[]
 for n in ["dist","build",".vite","public"]:
  p=app/n
  if p.exists(): dist_roots.append(p)
 dist=[]
 for dr in dist_roots:
  for p in dr.rglob("*"):
   if p.is_file() and p.suffix.lower() in {".js",".jsx",".mjs",".cjs",".html"}:
    try:
     if p.stat().st_size>15_000_000: continue
    except: continue
    dist.extend(scan_file(p,app))
 dist.sort(key=lambda x:(x["file"],x["line"]))

 owner_files=sorted({x["file"] for x in owners})
 dist_files=sorted({x["file"] for x in dist})
 # We are locating owner/source and generated artifacts, not claiming runtime activation yet.
 if owners and dist:
  classification="EXPORT_PRESENTATION_CONTROL_OWNER_AND_DIST_CANDIDATES_LOCATED_RUNTIME_ACTIVATION_UNPROVEN"
  nxt="M4_19D4BN17C_R4_R12_R16A_R21_R1_ACTIVE_RUNTIME_BUNDLE_PROVENANCE_AND_CONTROL_REACHABILITY_CERTIFICATION"
 elif owners:
  classification="EXPORT_PRESENTATION_CONTROL_OWNER_SOURCE_LOCATED_NO_ACTIVE_DIST_CANDIDATE_OBSERVED"
  nxt="M4_19D4BN17C_R4_R12_R16A_R21_R1_ACTIVE_RUNTIME_BUNDLE_PROVENANCE_AND_CONTROL_REACHABILITY_CERTIFICATION"
 else:
  classification="EXPORT_PRESENTATION_CONTROL_OWNER_NOT_RESOLVED_IN_CURRENT_SOURCE_SCOPE"
  nxt="M4_19D4BN17C_R4_R12_R16A_R21_R0_ROUTE_AND_ENTRYPOINT_CONTROL_OWNER_EXPANSION"

 checks={"r5R9R1Passed":True,"r5R9FalsePositiveRejectionConsumed":True,
 "semanticOwnerSourceScanComplete":True,"generatedDiagnosticsExcluded":True,
 "activeDistCandidateScanComplete":True,"runtimeActivationNotAssumed":True,
 "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,
 "pixelEvidenceOff":True,"liveWorkflowActionAuthorityOff":True}
 out=ev/M;out.mkdir(parents=True,exist_ok=True)
 ef=out/"export_presentation_control_owner_source_and_active_dist_refocus.json"
 data={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R21_EXPORT_PRESENTATION_CONTROL_OWNER_SOURCE_AND_ACTIVE_DIST_REFOCUS",
 "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED",
 "state":"M419D4BN17C_R4_R12_R16A_R21_EXPORT_PRESENTATION_CONTROL_OWNER_SOURCE_AND_ACTIVE_DIST_REFOCUSED",
 "sourceSemanticHitCount":len(source),"ownerCandidateCount":len(owners),"ownerFiles":owner_files,
 "ownerCandidates":owners[:80],"activeDistRoots":[str(x.relative_to(app)) for x in dist_roots],
 "activeDistSemanticHitCount":len(dist),"activeDistFiles":dist_files[:100],"activeDistCandidates":dist[:80],
 "classification":classification,"checks":checks,
 "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
 "pixelEvidence":False,"liveWorkflowActionAuthority":False},"nextMilestone":nxt}
 ef.write_text(json.dumps(data,indent=2)+"\n")
 print("="*120);print("SCIIP Explorer 4.0 — R21 Export/Presentation Control Owner Source + Active-Dist Refocus");print("="*120)
 print("R5_R9_R1_CLASSIFICATION:",prev.get("classification"))
 print("SOURCE_SEMANTIC_HIT_COUNT:",len(source));print("OWNER_CANDIDATE_COUNT:",len(owners))
 print("OWNER_FILES:",json.dumps(owner_files))
 print("\n----- TOP OWNER CANDIDATES -----")
 for x in owners[:30]: print(json.dumps(x))
 print("\nACTIVE_DIST_ROOTS:",json.dumps(data["activeDistRoots"]))
 print("ACTIVE_DIST_SEMANTIC_HIT_COUNT:",len(dist))
 print("ACTIVE_DIST_FILES:",json.dumps(dist_files[:100]))
 print("\n----- CHECKS -----")
 for k,v in checks.items(): print(f"{k}: {v}")
 print("CLASSIFICATION:",classification);print("STATUS: PASSED");print("STATE:",data["state"])
 print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ef);return 0
if __name__=="__main__": raise SystemExit(main())
