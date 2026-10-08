SCIIP Explorer 4.0 — M4.19D4BN16A-R3
Tolerant Evidence Decoder + 25-Record Governed Cohort Preauthorization

Repairs BN16A-R2's failure reading BN16A-R1 evidence.

Observed failure:
json.decoder.JSONDecodeError: Extra data

R3 changes only evidence ingestion:
- decodes the first valid JSON object from R1 evidence
- tolerates trailing appended text/JSON fragments
- preserves the corrected R2 address matcher
- preserves governed source-inventory discovery
- preserves strict contamination rejection
- preserves original exact-ten cohort first and unchanged
- preserves deterministic 15-new / 25-total policy
