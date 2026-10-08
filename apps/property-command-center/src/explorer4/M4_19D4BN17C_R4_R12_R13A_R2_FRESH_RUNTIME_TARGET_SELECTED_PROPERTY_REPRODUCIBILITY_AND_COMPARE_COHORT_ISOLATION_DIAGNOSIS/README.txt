SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R13A-R2
Fresh Runtime Target Selected-Property Reproducibility + Compare Cohort Isolation Diagnosis

R13A-R1 proved:
- first property Compare activation reproduces and certifies;
- Compare surface clears after root navigation;
- explicit Close control is absent;
- record 2 selected-property preparation still fails after:
  * root navigation,
  * explicit-close probe + root navigation,
  * root navigation + hard reload.

Therefore Compare post-action UI state is not sufficient to explain the record-2 failure.

R13A-R2 isolates the selected-property precondition itself:
1. test 2701 Carrier Ave in the currently reusable Explorer target;
2. create a brand-new Explorer page target in the same CDP browser and test again;
3. launch a brand-new isolated Chrome/CDP profile and test again;
4. capture exact search materialization, match counts, event-bearing candidate rankings, and post-click property visibility;
5. compare record 2 with 2 Musick under the same fresh-target conditions;
6. classify the residual as:
   - REUSED_TARGET_STATE_CONTAMINATION,
   - SAME_BROWSER_CONTEXT_CONTAMINATION,
   - PROPERTY_SPECIFIC_CLICK_TARGET_GAP,
   - or SEARCH_MATERIALIZATION_GAP.

No Compare action is required for this diagnosis.
No application or governed-data mutation.
