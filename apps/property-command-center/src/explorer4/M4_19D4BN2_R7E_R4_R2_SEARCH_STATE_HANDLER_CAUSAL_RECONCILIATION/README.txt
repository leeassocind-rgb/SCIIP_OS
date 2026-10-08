SCIIP Explorer 4.0
Milestone M4.19D4BN2-R7E-R4-R2
SEARCH STATE HANDLER CAUSAL RECONCILIATION

PURPOSE
-------
Trace the live source causal chain, without production application mutation:

SCIIPBrokerApp searchText
-> Enter handler
-> sessionStorage handoff
-> setNav('Explorer')
-> sciip:global-property-search dispatch
-> BrokerDestination routing
-> actual Explorer mount/import
-> Explorer query state
-> custom-event/sessionStorage consumption
-> governed property search resolver
-> candidate/result state
-> rendered result markup

THIS PACKAGE IS DIAGNOSTIC-ONLY.
It does not edit governed data, canonical identity, runtime mirror, temporal state,
or production application source.

EXPECTED REPOSITORY
-------------------
~/Desktop/SCIIP_OS-main-merge

PRIMARY APPLICATION
-------------------
apps/property-command-center

LATEST KNOWN SCIIPBrokerApp.jsx SHA256
--------------------------------------
eabdecbddacfd969524bfda6027d88a9d3b81df9458b1bda3f1dca61fa93e413

The analyzer records source drift if the hash differs. A mismatch does not get
silently ignored; the evidence report will explicitly identify it.

RUN
---
cd ~/Downloads
unzip -o SCIIP_OS_Explorer_4_0_Milestone_M4_19D4BN2_R7E_R4_R2_Search_State_Handler_Causal_Reconciliation.zip

~/Downloads/SCIIP_OS_Explorer_4_0_Milestone_M4_19D4BN2_R7E_R4_R2_Search_State_Handler_Causal_Reconciliation/APPLY_M4_19D4BN2_R7E_R4_R2_SEARCH_STATE_HANDLER_CAUSAL_RECONCILIATION.command \
  ~/Desktop/SCIIP_OS-main-merge

OUTPUT
------
The package installs its diagnostic assets under:

apps/property-command-center/src/explorer4/M4_19D4BN2_R7E_R4_R2_SEARCH_STATE_HANDLER_CAUSAL_RECONCILIATION/

Evidence is written under:

apps/property-command-center/evidence/explorer4/M4_19D4BN2_R7E_R4_R2_SEARCH_STATE_HANDLER_CAUSAL_RECONCILIATION/

Primary evidence:
- causal_reconciliation.json
- causal_reconciliation.txt
- searched_files.txt
- source_manifest.json

TERMINAL STATUS
---------------
The diagnostic reports one of:

DIAGNOSTIC_COMPLETE
BLOCKED_SOURCE_PRECONDITION
BLOCKED_ROUTING_UNRESOLVED
BLOCKED_EXPLORER_SURFACE_UNRESOLVED

and a causal diagnosis such as:

GLOBAL_SEARCH_EVENT_DISPATCH_BEFORE_EXPLORER_LISTENER_MOUNT
SESSION_QUERY_WRITTEN_BUT_NOT_CONSUMED
BROKER_DESTINATION_MOUNTS_NON_SEARCH_EXPLORER_SURFACE
EXPLORER_QUERY_STATE_DISCONNECTED_FROM_BROKER_QUERY
SEARCH_RESOLVER_NOT_BOUND_TO_LIVE_EXPLORER
MULTIPLE_CAUSAL_BOUNDARIES_REMAIN
CAUSAL_CHAIN_CONNECTED_NO_STATIC_DEFECT_PROVEN

This milestone never converts uncertainty into PASS.

GOVERNANCE
----------
canonicalWriteAuthority = false
identityWriteAuthority = false
temporalWriteAuthority = false
propagationAuthority = false
networkAuthority = false
automaticRetry = false
applicationSourceMutation = false

NEXT STEP
---------
Use the terminal output and causal_reconciliation.json to design the bounded
R4-R3 remediation. Do not remediate before R4-R2 identifies the actual live path.
