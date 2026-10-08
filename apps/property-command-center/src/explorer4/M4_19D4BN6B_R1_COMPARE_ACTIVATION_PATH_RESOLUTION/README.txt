SCIIP Explorer 4.0
M4.19D4BN6B-R1
COMPARE ACTIVATION PATH RESOLUTION

BACKGROUND
----------
BN6A-R1 source-certified the Compare consumer chain:
governedSelectedMapRuntime.mapProperty || sourceSelectedProperty
-> property.id
-> toggleCompare(property.id)
-> CompareDock

BN6B live observation failed 10/10 only because:
compareButtonCount: 0
compareControlClicked: False
OUTCOME: COMPARE_CONTROL_NOT_FOUND

This does NOT prove Compare is broken. It proves that the live activation affordance
is not a visible button whose innerText/title/aria-label contains "Compare".

PURPOSE
-------
Resolve the actual live/source activation path for Compare without modifying source.

The diagnostic inspects:
- action dispatchers containing action==='compare'
- callers of runAction / onAction / property action controls
- Property drawer / Property Intelligence action surfaces
- icon-only buttons and data-* attributes
- Command palette actions
- CompareDock mount conditions
- workspace.toggleCompare and workspace compare state
- any DOM node whose click handler is indirectly represented by compare/action metadata

OUTPUT
------
If a deterministic activation route can be resolved, R1 emits the route and selects:
M4_19D4BN6B_R2_EXACT_TEN_LIVE_COMPARE_ACTIVATION_PATH_RECERTIFICATION

NO APPLICATION SOURCE MUTATION.
NO GOVERNED DATA MUTATION.
NO NETWORK AUTHORITY.
NO PIXEL EVIDENCE.


R1-R1 REPAIR
------------
The original R1 static test incorrectly required the literal token COMPARE_CONTROL_NOT_FOUND inside resolve_bn6b_r1.py. That token belongs to the prior BN6B live evidence, not the R1 diagnostic implementation. R1-R1 removes that invalid self-test expectation. Diagnostic logic is otherwise unchanged.

R1-R2 REPAIR
------------
The prior static test still confused repository-source literals with analyzer-source
literals. R1-R2 validates the diagnostic implementation itself, including its regex
for workspace.toggleCompare(property.id), dispatcher resolution, consumer-reference
resolution, CompareDock resolution, activation-route classification, evidence output,
and next-milestone transition.

The actual Compare activation-path diagnostic logic is unchanged.
