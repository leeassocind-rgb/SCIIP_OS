R29A-R4-R2-R2-R2-R3-R1

R29A-R4-R2-R2-R2-R3 proved:
- SCIIP runtime is healthy again;
- a fresh CDP page attaches successfully;
- Explorer materializes at 0.75 seconds;
- the selector still fails only because choose_prior200 reports that it cannot
  reconstruct the exact disjoint authoritative prior-200 cohort.

This milestone is read-only and diagnoses the selector itself. It imports the
current selector without running main(), then uses the selector's own
marker_identity(), keyset(), and choose_prior200() helpers against the exact
certified R28A-R3 prior-200 and R28A-R4 new-200 artifacts.

It captures:
- configured authoritative source path;
- raw and helper-normalized cohort counts;
- overlap under the current helper key domain;
- direct choose_prior200 return/exception readback;
- exact current authoritative branch source.

No live inventory, product UI interaction, or Export is required.
