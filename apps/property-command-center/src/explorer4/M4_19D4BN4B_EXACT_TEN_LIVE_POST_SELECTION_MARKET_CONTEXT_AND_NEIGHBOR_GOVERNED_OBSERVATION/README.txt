SCIIP Explorer 4.0
M4.19D4BN4B
EXACT-TEN LIVE POST-SELECTION MARKET CONTEXT + NEIGHBOR GOVERNED OBSERVATION

PREREQUISITE
------------
BN4A:
STATUS: PASSED
STATE: M419D4BN4A_EXACT_TEN_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFIED
DIAGNOSIS:
EXACT_TEN_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_CONTRACT_PARITY_CERTIFIED

PURPOSE
-------
Observe the BN4A source-certified chain in the live running Explorer for the exact
approved ten-property cohort.

For each property:
1. select through the real Search SCIIP flow
2. verify Explorer mounts and selected property remains visible
3. verify Market Context ribbon is present/visible
4. open the Market drawer and verify it becomes visible
5. return/close as needed, then open Neighbors drawer
6. verify Neighbors drawer becomes visible
7. verify map remains visible
8. record market/neighbor drawer text and selected-property continuity
9. record neighbor relationship-oriented DOM signals
10. fail closed on any broken live consumer path

Browser bootstrap is hardened:
- only reuses CDP endpoints with a verified localhost SCIIP page target
- excludes chrome-extension:// targets
- otherwise launches a fresh isolated Chrome profile on a clean port

NO APPLICATION SOURCE MUTATION.
NO GOVERNED DATA MUTATION.
NO PIXEL EVIDENCE.
