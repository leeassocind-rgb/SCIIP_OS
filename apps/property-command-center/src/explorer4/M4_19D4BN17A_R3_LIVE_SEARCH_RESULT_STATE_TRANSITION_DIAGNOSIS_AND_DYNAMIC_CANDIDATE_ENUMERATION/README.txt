SCIIP Explorer 4.0 — M4.19D4BN17A-R3
Live Search Result-State Transition Diagnosis + Dynamic Candidate Enumeration

Purpose:
BN17A-R2 showed every prefix was accepted by the search input, but only the first query
produced any new candidates. That strongly indicates stale result-state harvesting rather
than a true 17-record live-search ceiling.

R3:
- preserves the certified 25-record reference cohort
- remains read-only
- uses the self-contained CDP WebSocket client
- snapshots search-result state before each query
- changes the query through the live search input
- waits for DOM/result-state transition
- harvests candidates only after the result state has changed
- records per-query before/after signatures and transition timing
- deterministically accumulates unique live-searchable identities
- preauthorizes exactly 50 records only if at least 25 new live identities are proven

No application-source mutation.
No governed-data mutation.
No network write authority.
Pixel evidence OFF.
