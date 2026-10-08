SCIIP Explorer 4.0 — R22B-R2-R1

R22B-R2 successfully certified the repaired policy but its patcher searched for the wrong
textual form of the R22B continuity predicate.

Actual R22B executor:
  out["reportReviewContinuity"]=bool(d.get("reportReviewVisible"))

R22B-R1 already proved that successful onPublish intentionally calls:
  setShowReportReview(false)

Therefore R22B-R2-R1 patches only a copied certification executor to:
  out["postPublishReportReviewUnmountCertified"]=not bool(d.get("reportReviewVisible"))

It then verifies that all other guards remain present:
- exactly one PDF download / object URL
- application/pdf
- positive PDF size
- zero runtime errors / unhandled rejections
- Explorer continuity
- same-origin continuity
- strict sequential / halt-on-first-failure
- maximum one Export click per record

Application source remains untouched.
