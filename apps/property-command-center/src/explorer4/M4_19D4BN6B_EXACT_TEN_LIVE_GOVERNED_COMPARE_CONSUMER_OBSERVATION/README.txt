SCIIP Explorer 4.0
M4.19D4BN6B
EXACT-TEN LIVE GOVERNED COMPARE CONSUMER OBSERVATION

PREREQUISITE
------------
BN6A-R1:
STATUS: PASSED
STATE: M419D4BN6A_R1_EXACT_TEN_GOVERNED_COMPARE_SELECTED_PROPERTY_BINDING_CERTIFIED
DIAGNOSIS:
BN6A_BINDING_PROBE_IDENTIFIER_MISMATCH_RECONCILED_COMPARE_CONTRACT_CERTIFIED

PURPOSE
-------
Observe the source-certified Compare consumer in the live running Explorer.

For each exact-ten property:
1. enter exact Search SCIIP query
2. dispatch Enter through the controlled React input
3. verify Explorer mounts
4. verify map remains visible
5. activate Compare through the live UI if a Compare control is present
6. otherwise invoke the live Compare action pathway only through an existing DOM
   control whose text/title/aria-label resolves to Compare
7. verify CompareDock becomes visible or compare-oriented UI state becomes observable
8. verify downstream map remains visible
9. record selected/compare-oriented DOM signals
10. fail closed if Compare cannot be observed

This milestone does not mutate source or governed data.
No pixel equality is claimed.

BROWSER BOOTSTRAP
-----------------
- detect local SCIIP app
- reuse only validated localhost SCIIP CDP targets
- exclude chrome-extension:// targets
- otherwise launch fresh isolated Chrome target

EXPECTED SUCCESS
----------------
OBSERVED: 10/10
STATUS: PASSED
STATE: M419D4BN6B_EXACT_TEN_LIVE_GOVERNED_COMPARE_CONSUMER_OBSERVED
DIAGNOSIS: EXACT_TEN_LIVE_GOVERNED_COMPARE_CONSUMER_OBSERVED
NEXT: BN6B_CERTIFIED_LIFECYCLE_CLOSURE_READY
NEXT_MILESTONE: M4_19D4BN6C_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CLOSURE
