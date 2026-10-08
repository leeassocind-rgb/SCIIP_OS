SCIIP Explorer 4.0 — R22B-R1
Guarded Export Micro-Cohort Residual Causal Diagnosis

R22B's first record produced a valid PDF export:
- Export clicked: true
- PDF download count: 1
- application/pdf object-URL count: 1
- PDF size: positive
- runtime errors: 0
- unhandled rejections: 0
- Explorer continuity: true
- same-origin continuity: true

The only failed certification condition was:
  reportReviewContinuity = false

R22B-R1 performs NO additional Export invocation.

It inspects:
- InstitutionalReportReview exportReport source,
- the parent onPublish callback,
- setShowReportReview state transitions,
- whether publish intentionally closes/unmounts Report Review,
- whether R21-R4 used a broader continuity predicate that could have produced a false-positive,
- whether R22B's stricter predicate accurately detected the intended unmount.

If the source contract confirms post-publish unmount is intended, the next milestone will repair
the certification guard—not the application—and rerun the exact-three-record guarded cohort.

Application source mutation OFF.
Governed data mutation OFF.
Network authority OFF.
Pixel evidence OFF.
