SCIIP Explorer 4.0 — M4.19D4BN16A-R2
Address Matcher Repair + 25-Record Governed Cohort Preauthorization

Repairs BN16A-R1's over-escaped address regex. R1 scanned 2,179 source files
but qualified zero candidates because the generated regex searched for literal
backslashes instead of real word boundaries/digit classes.

R2 preserves:
- governed source-inventory discovery
- strict single-line/UI contamination rejection
- original exact-ten cohort first and unchanged
- deterministic normalized-label ordering
- exactly 15 new candidates / exactly 25 total
- read-only authority
