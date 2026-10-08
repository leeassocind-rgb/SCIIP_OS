R20-R5-R1 corrects a causal false positive in R20-R5.

R20-R5's emitted evidence shows symbol O is a capability lifecycle initializer returning
status INITIALIZED, and caller G is capability registration/bootstrap. Its Export adjacency
was caused by bare JavaScript ES-module `export{G as b}` syntax, not an application Export action.

This repair:
- explicitly excludes bare ES-module export syntax as Export-role evidence;
- penalizes lifecycle/bootstrap initializers;
- requires strict workspace-loader semantic markers;
- scans all active dist assets read-only;
- does not advance to argument binding unless a strict loader neighborhood is actually resolved.
