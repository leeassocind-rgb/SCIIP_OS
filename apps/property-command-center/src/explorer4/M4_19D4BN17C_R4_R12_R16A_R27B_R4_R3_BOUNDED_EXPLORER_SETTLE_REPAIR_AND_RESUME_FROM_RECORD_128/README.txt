SCIIP Explorer 4.0 — R27B-R4-R3
Bounded Explorer Settle Repair + Resume from Record 128

R27B-R4-R2 proved:
- record 128 fresh page was healthy;
- Explorer first became uniquely visible/enabled at 0.35 seconds;
- Explorer remained stable thereafter;
- the existing two-second policy is sufficient;
- the prior failure was transient sampling during the initial interactive/empty-DOM phase.

Repair:
The Explorer settle remains exactly:
- maximum 2.0 seconds
- 3 consecutive unique visible/enabled samples

But samples are now counted only after:
- document.readyState == complete
- the page has a nonzero button DOM

This does NOT extend the two-second ceiling.

Resume policy:
- preserve records 101-127 as already certified;
- do not replay them;
- resume at record 128;
- execute only residual ordinals 128-200 (73 records);
- strict sequential;
- halt on first failure;
- source-certified Download Client Listing Report -> exportReport binding;
- Export invocation OFF.

On 73/73 residual pass:
27 prior + 73 residual = exact 100/100 new records certified.
Next: R27C Exact Two-Hundred Guarded Export Execution Readiness + Authorization.
