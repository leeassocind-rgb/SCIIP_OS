R29A-R4-R2-R2-R2-R3-R2-R2

The prior diagnosis proved main() called live_inventory()/settle_explorer()
before choose_prior200(), even though the authoritative prior-200 branch is
already closed evidence and no longer depends on live inventory.

This package performs a narrow selector control-flow repair:
1. resolve authoritative prior-200 first with choose_prior200(er,new200,set());
2. reconstruct the closed reference cohort;
3. only then call live_inventory() for the new-400 candidate selection phase;
4. rerun the authoritative R29A selector.

No governed data is mutated. No property/Assignments/Generate/Export action is authorized.
