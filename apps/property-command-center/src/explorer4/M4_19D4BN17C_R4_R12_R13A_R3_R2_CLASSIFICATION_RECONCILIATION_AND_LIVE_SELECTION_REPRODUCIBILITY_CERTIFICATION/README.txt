SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R13A-R3
R2 Classification Reconciliation + Live Selection Reproducibility Certification

R2 raw evidence:
- REUSED_EXISTING_TARGET_SELECTED_PROPERTY_CERTIFIED: True
- FRESH_PAGE_SAME_BROWSER_SELECTED_PROPERTY_CERTIFIED: True
- FRESH_ISOLATED_BROWSER_*: None
- CONTROL_FRESH_ISOLATED_BROWSER_CERTIFIED: False
- CLASSIFICATION emitted: PROPERTY_SPECIFIC_CLICK_TARGET_GAP

That classification is internally inconsistent with the observed live results. A property-specific
click-target gap cannot be supported when the same property certifies in both reused and fresh-page
contexts.

R3 performs evidence reconciliation only:
1. re-read R2 evidence;
2. distinguish false/failed from missing/not-executed isolated-browser observations;
3. certify record-2 selection reproducibility from the two successful live contexts;
4. invalidate the PROPERTY_SPECIFIC_CLICK_TARGET_GAP diagnosis as unsupported by R2 evidence;
5. classify the isolated-browser branch separately as UNOBSERVED / INCOMPLETE;
6. select the safest next Compare recertification policy.

No live UI actions.
No application source mutation.
No governed-data mutation.
