SCIIP Explorer 4.0
M4.19D4BN5B
EXACT-TEN LIVE GOVERNED SPATIAL SELECTION + MAP FOCUS OBSERVATION

PREREQUISITE
------------
BN5A:
STATUS: PASSED
STATE: M419D4BN5A_EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_CERTIFIED
DIAGNOSIS:
EXACT_TEN_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_CONTRACT_PARITY_CERTIFIED

PURPOSE
-------
Observe the BN5A-certified spatial selection/focus contract in the running Explorer.

For each exact-ten property:
1. enter the exact Search SCIIP query
2. dispatch Enter through the controlled React input
3. verify Explorer mounts
4. verify map remains visible
5. verify the selected property has post-selection UI presence
6. observe selected/active/map-marker/focus-oriented DOM signals
7. verify a focus-like map state is present after the global-search auto-selection
8. open Property and Neighbors consumers without changing selection
9. verify map remains visible after downstream interaction
10. record all DOM/runtime observations without screenshots

This milestone does NOT claim pixel-center equality. It is a live behavioral observation
of the governed selection/focus pathway already source-certified by BN5A.

BROWSER BOOTSTRAP
-----------------
- Detect running local SCIIP app
- Reuse a CDP endpoint only when it contains a verified SCIIP localhost page
- Exclude chrome-extension:// targets
- Otherwise launch an isolated Chrome profile on a fresh CDP port

NO APPLICATION SOURCE MUTATION.
NO GOVERNED DATA MUTATION.
NO CANONICAL/IDENTITY/TEMPORAL/PROPAGATION AUTHORITY.
NO PIXEL EVIDENCE.
