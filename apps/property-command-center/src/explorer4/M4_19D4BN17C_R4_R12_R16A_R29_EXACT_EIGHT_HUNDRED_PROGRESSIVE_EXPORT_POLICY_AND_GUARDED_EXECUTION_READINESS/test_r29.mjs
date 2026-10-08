import fs from "node:fs";
const p=fs.readFileSync(new URL("./certify_r29.py", import.meta.url),"utf8");
const assertions=[
["R28E dependency",p.includes("R28E")],
["reference 400",p.includes('"referenceCohortSize":reference')],
["next 800",p.includes("nxt=800")],
["new 400",p.includes("new=400")],
["progressive delta 400",p.includes("PROGRESSIVE_DELTA_FOUR_HUNDRED")],
["no reference reexport",p.includes('"referenceReexportRequired":False')],
["qualification required",p.includes('"requiredBeforeLiveExport":True')],
["fresh page",p.includes('"freshPagePerRecord":True')],
["strict sequential",p.includes('"strictSequential":True')],
["halt first failure",p.includes('"haltOnFirstFailure":True')],
["3 sample explorer",p.includes('"consecutiveSamples":3')],
["2 sec explorer",p.includes('"maximumSeconds":2.0')],
["page ready anchor",p.includes("DOCUMENT_COMPLETE_AND_NONZERO_BUTTON_DOM_AND_APP_ORIGIN")],
["5 sec target",p.includes('"maximumSeconds":5.0')],
["canonical building/project",p.includes('"buildingProjectAwareCanonicalBindingRequired":True')],
["ambiguous address forbidden",p.includes('"ambiguousAddressOnlyBindingForbidden":True')],
["single export click",p.includes('"maxExportClicksPerRecord":1')],
["authority relock",p.includes('"authorityRelockAfterEveryRecord":True')],
["pdf count",p.includes('"pdfDownloadCountMustEqual":1')],
["object url count",p.includes('"pdfObjectUrlEventCountMustEqual":1')],
["pdf mime",p.includes('"mimeMustEqual":"application/pdf"')],
["runtime errors zero",p.includes('"errorsMustEqual":0')],
["unhandled zero",p.includes('"unhandledRejectionsMustEqual":0')],
["same origin",p.includes('"sameOriginMustRemain":True')],
["no live UI",p.includes('"liveUiInteractionOff":True')],
["no export invocation",p.includes('"exportInvocationOff":True')],
["R29A next",p.includes("R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION")]
];
const failed=assertions.filter(x=>!x[1]);
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:assertions.length,failed:failed.map(x=>x[0])},null,2));
process.exit(failed.length?1:0);
