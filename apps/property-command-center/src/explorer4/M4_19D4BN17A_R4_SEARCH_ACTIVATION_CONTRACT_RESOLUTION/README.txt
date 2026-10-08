SCIIP Explorer 4.0 — M4.19D4BN17A-R4
Search Activation Contract Resolution

Purpose
BN17A-R3 proved that directly changing the visible input value does not transition
Explorer search-result state. R4 resolves the actual application search activation
contract from source before any further live enumeration attempt.

R4 is read-only and diagnoses:
- search input component and controlled state
- onChange / input setter path
- Enter / submit / button activation path
- result list / command result surface
- property selection dispatcher
- whether search is local filtering, command dispatch, or another controlled route

No application-source mutation.
No governed-data mutation.
No network authority.
No pixel evidence.
