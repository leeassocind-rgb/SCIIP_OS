#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bk2-r1-browser-runtime-visibility-and-explorer-read-path-certification.json");
const interaction=path.join(ev,"m4-19d4bk2-r2-r1-cdp-navigation-result.json");
const out=path.join(ev,"m4-19d4bk2-r2-r1-dependency-free-live-explorer-navigation-and-search-control-reconciliation.json");

if(!fs.existsSync(prior)) throw new Error("BK2-R1 evidence missing");
const P=JSON.parse(fs.readFileSync(prior,"utf8"));
if(P.state!=="M419D4BK2_R1_BROWSER_RUNTIME_READ_PATH_CERTIFICATION_BLOCKED")
  throw new Error("BK2-R1 state mismatch: "+P.state);
if(!fs.existsSync(interaction)) throw new Error("BK2-R2-R1 CDP result missing");

const I=JSON.parse(fs.readFileSync(interaction,"utf8"));
const checks={
  priorBrowserRenderHealthy:
    P.certification?.shellChecks?.serverReachable===true &&
    P.certification?.shellChecks?.domCaptured===true &&
    P.certification?.shellChecks?.explorerShellVisible===true,
  priorSearchControlAbsent:
    P.certification?.shellChecks?.searchControlVisible===false,
  uniqueExplorerNavigationControl:
    I.before?.explorerCandidates?.length===1,
  explorerNavigationActivated:
    I.click?.clicked===true,
  explorerMountedAfterNavigation:
    I.after?.explorerMounted===true,
  exactSearchControlUnique:
    I.after?.searchControlCount===1,
  exactSearchType:
    I.after?.searchControls?.[0]?.type==="search",
  exactSearchPlaceholder:
    I.after?.searchControls?.[0]?.placeholder==="Search SCIIP…",
  exactSearchAria:
    I.after?.searchControls?.[0]?.aria==="Search SCIIP"
};
const passed=Object.values(checks).every(Boolean);

const R={
  contract:"SCIIP_EXPLORER_4_M4_19D4BK2_R2_R1_DEPENDENCY_FREE_LIVE_EXPLORER_NAVIGATION_AND_SEARCH_CONTROL_READ_PATH_RECONCILIATION",
  version:"4.0-m4.19d4bk2-r2-r1",
  status:passed?"PASSED":"BLOCKED",
  state:passed
    ?"M419D4BK2_R2_R1_LIVE_EXPLORER_NAVIGATION_AND_EXACT_SEARCH_CONTROL_CERTIFIED_BK3_READY"
    :"M419D4BK2_R2_R1_LIVE_EXPLORER_NAVIGATION_OR_SEARCH_BINDING_NOT_CERTIFIED",
  certifiedAt:new Date().toISOString(),
  correction:{
    priorR2Failure:"PYTHON_WEBSOCKET_CLIENT_MODULE_NOT_INSTALLED",
    dependencyInstallationPerformed:false,
    replacement:"SELF_CONTAINED_RFC6455_WEBSOCKET_CLIENT_USING_PYTHON_STANDARD_LIBRARY",
    applicationChangeRequired:false
  },
  certification:{
    before:I.before,
    navigation:I.click,
    after:I.after,
    checks
  },
  cohort:{
    size:5,
    runtimeMirrorBindingsCertified:
      P.certification?.shellChecks?.allFiveCanonicalMirrorBindingsStillCertified===true
  },
  artifacts:{
    interaction,
    screenshot:path.join(ev,"m4-19d4bk2-r2-r1-post-navigation-screenshot.png"),
    browserStderr:path.join(ev,"m4-19d4bk2-r2-r1-chrome-stderr.log")
  },
  policy:{
    exactVisibleExplorerNavigationUsed:true,
    inventedRouteInferenceProhibited:true,
    externalPythonDependencyProhibited:true,
    applicationMutation:false,
    canonicalMutation:false,
    eventMutation:false,
    governedInventoryMutation:false,
    interactivePropertySearchNotYetExecuted:true
  },
  nextMilestone:passed
    ?"M4.19D4BK3_INTERACTIVE_FIVE_PROPERTY_EXPLORER_SEARCH_SELECTION_AND_VISIBILITY_CERTIFICATION"
    :"M4.19D4BK2_R3_NAVIGATION_CONTROL_RECONCILIATION",
  authorityClosure:{
    temporalWriteAuthority:false,
    canonicalWriteAuthority:false,
    identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,
    refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,
    syncAuthority:false,
    propagationAuthority:false,
    automaticRetry:false
  },
  safety:{
    networkRequestsPerformed:0,
    productionCanonicalMutationPerformed:false,
    productionEventMutationPerformed:false,
    temporalMutationPerformed:false,
    governedInventoryMutationPerformed:false,
    applicationMutationPerformed:false,
    uiSourceMutationPerformed:false,
    automaticRetry:false
  }
};

fs.writeFileSync(out,JSON.stringify(R,null,2)+"\n");
console.log(JSON.stringify(R,null,2));
if(!passed) process.exit(2);
