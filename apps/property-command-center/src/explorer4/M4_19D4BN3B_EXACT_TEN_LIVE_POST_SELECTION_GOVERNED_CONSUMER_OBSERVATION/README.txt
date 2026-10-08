SCIIP Explorer 4.0
M4.19D4BN3B
EXACT-TEN LIVE POST-SELECTION GOVERNED CONSUMER OBSERVATION

PREREQUISITE
------------
BN3A:
STATUS: PASSED
STATE: M419D4BN3A_EXACT_TEN_POST_SELECTION_GOVERNED_CONSUMER_PARITY_CERTIFIED
DIAGNOSIS:
EXACT_TEN_POST_SELECTION_PROPERTY_DETAIL_AND_GOVERNED_CONSUMER_CONTRACT_PARITY_CERTIFIED

PURPOSE
-------
BN3A proved source-contract parity. BN3B now observes that contract in the live
running application for the exact approved ten-property cohort.

For each property BN3B:
1. returns to broker Home
2. enters the exact Search SCIIP query
3. dispatches Enter through the live controlled input
4. verifies Explorer mounts
5. verifies search resolves/auto-selects
6. verifies expected query/address is visible post-selection
7. opens the Property drawer through the live MapRail "Property" control
8. verifies ContextDrawer becomes visible
9. records live property-detail text
10. records selected/map/property-intelligence-oriented DOM evidence

No screenshot or screencast is required.
No application source mutation.
No governed data mutation.
No canonical/identity/temporal/propagation authority.

BROWSER
-------
The package detects the already-running local SCIIP app. It reuses a valid CDP
target when available or launches an isolated Chrome CDP profile when required.

It explicitly excludes chrome-extension:// targets.

FAIL-CLOSED STATES
------------------
BLOCKED_LOCAL_SCIIP_APP_UNAVAILABLE
BLOCKED_CHROME_EXECUTABLE_UNAVAILABLE
BLOCKED_CDP_BOOTSTRAP_FAILED
BLOCKED_SCIIP_PAGE_NOT_READY

LIVE OUTCOMES
-------------
POST_SELECTION_GOVERNED_CONSUMERS_OBSERVED
PROPERTY_DRAWER_CONTROL_NOT_FOUND
PROPERTY_DRAWER_NOT_VISIBLE
POST_SELECTION_PROPERTY_VISIBILITY_NOT_PROVEN
REACT_SEARCH_STATE_NOT_PROVEN
EXPLORER_NOT_MOUNTED
UNRESOLVED

RUN
---
cd ~/Downloads

unzip -o SCIIP_OS_Explorer_4_0_Milestone_M4_19D4BN3B_Exact_Ten_Live_Post_Selection_Governed_Consumer_Observation.zip

~/Downloads/SCIIP_OS_Explorer_4_0_Milestone_M4_19D4BN3B_Exact_Ten_Live_Post_Selection_Governed_Consumer_Observation/APPLY_M4_19D4BN3B_EXACT_TEN_LIVE_POST_SELECTION_GOVERNED_CONSUMER_OBSERVATION.command   ~/Desktop/SCIIP_OS-main-merge

EXPECTED SUCCESS
----------------
OBSERVED: 10/10
STATUS: PASSED
STATE: M419D4BN3B_EXACT_TEN_LIVE_POST_SELECTION_GOVERNED_CONSUMERS_OBSERVED
