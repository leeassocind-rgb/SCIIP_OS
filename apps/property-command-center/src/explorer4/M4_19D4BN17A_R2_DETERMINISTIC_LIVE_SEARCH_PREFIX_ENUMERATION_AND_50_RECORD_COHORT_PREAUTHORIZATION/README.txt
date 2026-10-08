SCIIP Explorer 4.0 — M4.19D4BN17A-R2
Deterministic Live-Search Prefix Enumeration + 50-Record Cohort Preauthorization

Why R2 exists
BN17A-R1 proved the self-contained CDP transport works, but a passive DOM snapshot
exposed only 17 new live-searchable addresses. That is insufficient for a 25-record
expansion.

R2 repairs candidate discovery, not governance:
- preserves the certified 25-record reference cohort unchanged
- preserves read-only authority
- actively queries the live Explorer search control using deterministic prefixes
- harvests only address-like identities returned by the live UI
- deduplicates against the existing 25 and across query results
- deterministically selects exactly 25 new records
- preauthorizes exactly 50 total records
- does not infer candidates from generic source inventory

No application-source mutation.
No governed-data mutation.
No network write authority.
Pixel evidence OFF.
