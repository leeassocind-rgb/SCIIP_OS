SCIIP Explorer 4.0
M4.19D4BN5A
EXACT-TEN GOVERNED SPATIAL SELECTION + MAP FOCUS CONTRACT CERTIFICATION

PREREQUISITE
------------
BN4C:
STATUS: PASSED
STATE: M419D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSED
DIAGNOSIS:
EXACT_TEN_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CERTIFIED_AND_CLOSED

PURPOSE
-------
BN2 closed global search/selection.
BN3 closed immediate post-selection governed consumers.
BN4 closed Market Context + Neighbor governed consumers.

BN5A certifies the next bounded spatial interaction contract:
selected governed property
-> governed market spatial highlight
-> ExplorerMap selected identity
-> governed map selection resolution
-> focusPropertyId / focusRequestKey
-> governed Property Intelligence / Neighbor focus selection
-> selected workspace identity transition

This milestone is READ_ONLY_CERTIFICATION.

It verifies:
- selected workspace identity is resolved from state.selectedPropertyId
- governed selected map runtime remains the property source
- spatial highlight is built from governed market metric detail + market context
- ExplorerMap consumes selectedPropertyId={property.id}
- map onSelect routes through resolveGovernedMarketSpatialSelection(...,'MAP')
- focus interactions route through resolveGovernedMarketSpatialSelection(...,'FOCUS')
- neighbor interactions route through resolveGovernedMarketSpatialSelection(...,'NEIGHBOR')
- Property Intelligence interactions route through resolveGovernedMarketSpatialSelection(...,'PROPERTY_INTELLIGENCE')
- successful global search sets focusPropertyId and increments focusRequestKey
- selectProperty clears stale focus before any new focus request
- ExplorerMap receives focusPropertyId and focusRequestKey
- no mutation authority is enabled

This is source-contract certification only. It does not claim live map pixel behavior.

RUN
---
cd ~/Downloads

unzip -o SCIIP_OS_Explorer_4_0_Milestone_M4_19D4BN5A_Exact_Ten_Governed_Spatial_Selection_and_Map_Focus_Contract_Certification.zip

~/Downloads/SCIIP_OS_Explorer_4_0_Milestone_M4_19D4BN5A_Exact_Ten_Governed_Spatial_Selection_and_Map_Focus_Contract_Certification/APPLY_M4_19D4BN5A_EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_CERTIFICATION.command   ~/Desktop/SCIIP_OS-main-merge

EXPECTED SUCCESS
----------------
CERTIFIED: 10/10
STATUS: PASSED
STATE: M419D4BN5A_EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_CERTIFIED
DIAGNOSIS: EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_PARITY_CERTIFIED
NEXT: BN5A_CERTIFIED_LIVE_SPATIAL_SELECTION_AND_FOCUS_OBSERVATION_READY
NEXT_MILESTONE: M4_19D4BN5B_EXACT_TEN_LIVE_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_OBSERVATION
