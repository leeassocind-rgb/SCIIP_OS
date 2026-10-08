R27B-R2-R3 captures the exact source-level binding between the rendered
'Download Client Listing Report' control and exportReport in
InstitutionalReportReview.jsx. It does not invoke Export and does not mutate
application or governed data. This resolves the failed attempt to infer a
React handler name from runtime DOM, where React does not expose the source
function name as a normal DOM attribute.