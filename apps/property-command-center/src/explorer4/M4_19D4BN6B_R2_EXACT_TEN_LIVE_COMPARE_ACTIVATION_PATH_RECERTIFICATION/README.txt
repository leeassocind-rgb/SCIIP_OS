SCIIP Explorer 4.0
M4.19D4BN6B-R2
EXACT-TEN LIVE COMPARE ACTIVATION-PATH RECERTIFICATION

PREREQUISITES
-------------
BN6A-R1:
STATUS: PASSED
STATE: M419D4BN6A_R1_EXACT_TEN_GOVERNED_COMPARE_SELECTED_PROPERTY_BINDING_CERTIFIED

BN6B-R1:
STATUS: PASSED
STATE: M419D4BN6B_R1_COMPARE_ACTIVATION_PATH_RESOLVED
DIAGNOSIS:
COMPARE_CONSUMER_PRESENT_LIVE_TEXT_BUTTON_ASSUMPTION_INVALID_ACTIVATION_PATH_RESOLVED
routeType: ACTION_DISPATCHER
dispatcher: runCommand

PURPOSE
-------
Recertify Compare through the ACTUAL live activation path rather than looking for
a visible button labeled Compare.

The resolved route is:
selected governed property
-> runCommand / action dispatcher
-> action='compare'
-> workspace.toggleCompare(property.id)
-> CompareDock

For each exact-ten property, R2:
1. searches/selects through the real Search SCIIP input
2. verifies Explorer and map visibility
3. resolves the live command/action surface
4. invokes the existing live Compare action through the resolved action dispatcher
5. verifies Compare-oriented UI/CompareDock becomes visible
6. verifies map remains visible
7. records compare-oriented DOM signals
8. fails closed if activation or consumer visibility cannot be proven

No application source mutation.
No governed data mutation.
No pixel evidence.
