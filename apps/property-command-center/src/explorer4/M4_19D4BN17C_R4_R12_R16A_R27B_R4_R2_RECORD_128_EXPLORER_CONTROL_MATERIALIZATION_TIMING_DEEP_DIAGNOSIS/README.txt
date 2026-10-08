SCIIP Explorer 4.0 — R27B-R4-R2
Record 128 Explorer Control Materialization Timing Deep Diagnosis

R27B-R4-R1 corrected the earlier interpretation:
record 128 (15881 Terminal Ct) failed first at explorerSettleCertified,
not targetBindingSettleCertified.

This milestone creates one fresh page and observes the Explorer control
through a bounded five-second window.

It DOES NOT:
- click Explorer
- click any property
- enter Assignments
- invoke Generate
- invoke Export
- mutate application source
- mutate governed data

It records:
- exact Explorer button count
- visible/enabled Explorer count
- Explorer-like control count
- Assignments count
- total buttons
- body length
- readyState
- URL/origin
- first unique Explorer materialization time
- stability over the final five samples

The result distinguishes a transient <=2s failure from a genuinely late or
missing Explorer bootstrap.
