SCIIP Explorer 4.0
M4.19D4BN2-R7F-R1
LIVE SEARCH LIFECYCLE CLOSURE

BACKGROUND
----------
The original R7F closure was conditional on R7E live exact-ten success and
correctly did not execute while R7E remained blocked.

Subsequent causal reconciliation established:
- SCIIPBrokerApp -> BrokerDestination -> PropertyExplorer -> Explorer3
- global-search causal contract certified
- sessionStorage fallback certified
- resolver/listener/selection/focus chain certified
- exact-ten live browser outcomes observed

Most recent live result:
STATUS: PASSED
DIAGNOSIS: EXACT_TEN_GLOBAL_SEARCH_OUTCOMES_OBSERVED
COUNTS: MATCH_AUTO_SELECTED_OR_POST_VISIBLE = 10

PURPOSE
-------
Close the BN2 live-search lifecycle only if all required evidence is present and
internally consistent.

This package:
1. Verifies R4-R2-R4 causal certification PASSED.
2. Verifies R4-R5-R1 exact-ten live recertification PASSED.
3. Verifies diagnosis EXACT_TEN_GLOBAL_SEARCH_OUTCOMES_OBSERVED.
4. Verifies exactly 10 records.
5. Verifies the exact approved ten-query cohort.
6. Verifies every record has controlledValueMatch=true.
7. Verifies every record mounted Explorer.
8. Verifies every record ended in MATCH_AUTO_SELECTED_OR_POST_VISIBLE.
9. Verifies no governed-data/application-source mutation authority was used.
10. Writes append-only lifecycle closure evidence.

NO APPLICATION SOURCE MUTATION.
NO GOVERNED DATA MUTATION.
NO NETWORK REQUESTS.
NO BROWSER AUTOMATION REQUIRED.

RUN
---
cd ~/Downloads

unzip -o SCIIP_OS_Explorer_4_0_Milestone_M4_19D4BN2_R7F_R1_Live_Search_Lifecycle_Closure.zip

~/Downloads/SCIIP_OS_Explorer_4_0_Milestone_M4_19D4BN2_R7F_R1_Live_Search_Lifecycle_Closure/APPLY_M4_19D4BN2_R7F_R1_LIVE_SEARCH_LIFECYCLE_CLOSURE.command   ~/Desktop/SCIIP_OS-main-merge

EXPECTED SUCCESS
----------------
STATUS: PASSED
STATE: M419D4BN2_R7F_R1_LIVE_SEARCH_LIFECYCLE_CLOSED
DIAGNOSIS: EXACT_TEN_LIVE_SEARCH_LIFECYCLE_CERTIFIED_AND_CLOSED
