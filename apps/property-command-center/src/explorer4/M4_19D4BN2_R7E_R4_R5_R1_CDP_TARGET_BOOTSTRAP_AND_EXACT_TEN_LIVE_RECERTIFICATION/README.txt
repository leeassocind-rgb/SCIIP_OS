SCIIP Explorer 4.0
M4.19D4BN2-R7E-R4-R5-R1
CDP TARGET BOOTSTRAP + EXACT-TEN LIVE RECERTIFICATION

PREREQUISITE
------------
R4-R5 static package certification PASSED, but live execution returned:

STATUS: BLOCKED
DIAGNOSIS: BLOCKED_BROWSER_TARGET_UNAVAILABLE

This is an infrastructure/browser-target blocker, not an application failure.

PURPOSE
-------
1. Detect a running local SCIIP Property Command Center URL.
2. Reuse an existing valid Chrome CDP target if present.
3. Otherwise launch an ISOLATED Google Chrome instance using:
   - a temporary SCIIP-specific user-data-dir
   - remote-debugging-port 9222 (or next available supported port)
   - the detected local SCIIP application URL
4. Explicitly reject extension/background targets.
5. Wait for the SCIIP broker shell/search control.
6. Run the exact-ten live global-search outcome reconciliation.
7. Preserve DOM/runtime evidence only; no screenshot/screencast.

IMPORTANT
---------
This package does NOT edit application source.
It does NOT edit governed data.
It does NOT alter canonical/identity/temporal/runtime stores.
It does NOT terminate or modify the user's normal Chrome profile.

If no SCIIP localhost application is running, the package fails closed with:

BLOCKED_LOCAL_SCIIP_APP_UNAVAILABLE

It does not silently start a different application or mutate package configuration.

RUN
---
cd ~/Downloads

unzip -o SCIIP_OS_Explorer_4_0_Milestone_M4_19D4BN2_R7E_R4_R5_R1_CDP_Target_Bootstrap_and_Exact_Ten_Live_Recertification.zip

~/Downloads/SCIIP_OS_Explorer_4_0_Milestone_M4_19D4BN2_R7E_R4_R5_R1_CDP_Target_Bootstrap_and_Exact_Ten_Live_Recertification/APPLY_M4_19D4BN2_R7E_R4_R5_R1_CDP_TARGET_BOOTSTRAP_AND_EXACT_TEN_LIVE_RECERTIFICATION.command   ~/Desktop/SCIIP_OS-main-merge

EXPECTED TERMINAL STATES
------------------------
PASSED
  EXACT_TEN_GLOBAL_SEARCH_OUTCOMES_OBSERVED

DIAGNOSTIC_COMPLETE
  EXACT_TEN_GLOBAL_SEARCH_RUNTIME_GAP_REMAINS

BLOCKED
  BLOCKED_LOCAL_SCIIP_APP_UNAVAILABLE
  BLOCKED_CHROME_EXECUTABLE_UNAVAILABLE
  BLOCKED_CDP_BOOTSTRAP_FAILED
  BLOCKED_SCIIP_PAGE_NOT_READY
