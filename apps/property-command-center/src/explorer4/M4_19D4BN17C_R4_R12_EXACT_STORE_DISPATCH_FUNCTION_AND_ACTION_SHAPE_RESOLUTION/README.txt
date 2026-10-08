SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12
Exact Store Dispatch Function + Action Shape Resolution

R4-R11 proved:
- store/context ownership is resolved;
- dispatchable functions exist in the live runtime;
- two micro-cohort records invoked candidate store actions;
- one record exposed no candidate action at all;
- no result materialized for any record.

Therefore the active boundary is:
LIVE DISPATCH FUNCTION -> EXACT ACTION TYPE / PAYLOAD SHAPE -> REDUCER / STORE TRANSITION -> RESULT STATE

R4-R12 is read-only and does not attempt full result certification. It resolves:
1. exact live dispatch function fingerprints;
2. reducer/action type literals from source;
3. action creators and payload field names;
4. whether dispatch expects string, object, tuple, query object, or nested payload;
5. whether the same dispatch surface is stable across the 3-record micro-cohort;
6. one canonical action-shape candidate for the next certification milestone.

Application source mutation: OFF
Governed data mutation: OFF
Network authority: OFF
Pixel evidence: OFF
