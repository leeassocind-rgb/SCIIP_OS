SCIIP Explorer 4.0
M4.19D4BN2-R7E-R4-R2-R1
BROKERDESTINATION ROUTING RESOLUTION

PURPOSE
-------
R4-R2 successfully preserved all authority boundaries and verified the expected
SCIIPBrokerApp.jsx source hash, but its diagnostic harness returned:

STATUS: BLOCKED_ROUTING_UNRESOLVED
DIAGNOSIS: BROKER_DESTINATION_ROUTE_UNRESOLVED

At the same time it found:
- candidate Explorer surface files
- one global-search listener
- one sessionStorage reader
- multiple resolver files
- multiple candidate-state signal files

Therefore R4-R2-R1 repairs the DIAGNOSTIC RESOLUTION PATH, not the application.

This milestone identifies the exact symbol/path that satisfies:
<BrokerDestination destination={nav} ... />

It searches:
- inline function/class/const declarations
- imported default/named/namespace symbols
- import aliases
- re-exports
- local aliases
- JSX call sites
- object/route maps
- dynamic/lazy imports
- destination === 'Explorer' branches
- destination maps containing Explorer

It then emits exact source locations and hashes.

NO APPLICATION SOURCE MUTATION.
NO GOVERNED DATA MUTATION.
NO NETWORK REQUESTS.

RUN
---
cd ~/Downloads
unzip -o SCIIP_OS_Explorer_4_0_Milestone_M4_19D4BN2_R7E_R4_R2_R1_BrokerDestination_Routing_Resolution.zip

~/Downloads/SCIIP_OS_Explorer_4_0_Milestone_M4_19D4BN2_R7E_R4_R2_R1_BrokerDestination_Routing_Resolution/APPLY_M4_19D4BN2_R7E_R4_R2_R1_BROKERDESTINATION_ROUTING_RESOLUTION.command   ~/Desktop/SCIIP_OS-main-merge

EVIDENCE
--------
apps/property-command-center/evidence/explorer4/M4_19D4BN2_R7E_R4_R2_R1_BROKERDESTINATION_ROUTING_RESOLUTION/

Primary:
- routing_resolution.json
- routing_resolution.txt
- relevant_source_manifest.json

EXPECTED OUTCOME
----------------
DIAGNOSTIC_COMPLETE with:
- exact BrokerDestination origin/resolution path
- Explorer route evidence
- exact Explorer component candidate(s)

If route resolution remains ambiguous, the milestone reports the exact competing
symbols/files rather than guessing.
