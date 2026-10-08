SCIIP Explorer 4.0
M4.19D4BN6A-R1
GOVERNED COMPARE SELECTED-PROPERTY BINDING RECONCILIATION

BACKGROUND
----------
BN6A was blocked by exactly one source-contract check:

governedPropertyUsesMapRuntime: False

All other Compare readiness/contract checks were True, including:
- selected identity resolved from workspace state
- governed selected-map runtime present
- CompareDock present
- toggleCompare present
- compare action present
- compare action uses selected property
- compare consumer receives governed property context

Earlier certified Explorer runtime evidence established the binding shape:

const property=governedSelectedMapRuntime.mapProperty||sourceSelectedProperty

The original BN6A probe checked for a different identifier name:
governedSelectedPropertyMapRuntime

R1 therefore reconciles the actual source binding instead of assuming either form.

PURPOSE
-------
Read-only verification of the exact causal chain:

state.selectedPropertyId
-> sourceSelectedProperty
-> resolveGovernedSelectedPropertyMapRuntime(...)
-> actual local runtime binding
-> property = <runtime>.mapProperty || sourceSelectedProperty
-> toggleCompare(property.id)
-> CompareDock consumer

If and only if that chain resolves in source, R1 certifies the exact-ten Compare
contract and advances to BN6B live observation.

NO APPLICATION SOURCE MUTATION.
NO GOVERNED DATA MUTATION.
NO NETWORK AUTHORITY.
NO PIXEL EVIDENCE.
