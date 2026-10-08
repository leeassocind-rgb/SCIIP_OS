SCIIP Explorer 4.0 — R4-R2-R4
Global Search Runtime Causal Certification

R4-R2-R3 resolved the live component chain:
SCIIPBrokerApp -> BrokerDestination -> PropertyExplorer -> Explorer3.

It also established that Explorer3 contains:
- resolveGlobalPropertySearch
- the sciip:global-property-search listener
- sessionStorage fallback consumption
- MATCH -> workspace selection -> focus request
- NO_MATCH / AMBIGUOUS feedback

R4-R2-R4 certifies that causal contract from repository source without mutating
application source or governed data. It also resolves PropertyExplorer -> Explorer3
rather than relying on broad token discovery.

DIAGNOSTIC / CERTIFICATION ONLY.
