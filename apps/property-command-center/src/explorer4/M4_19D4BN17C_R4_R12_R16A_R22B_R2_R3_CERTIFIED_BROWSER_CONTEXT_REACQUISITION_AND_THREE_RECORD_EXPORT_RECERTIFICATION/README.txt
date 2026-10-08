SCIIP Explorer 4.0 — R22B-R2-R3

R22B-R2-R2 verified both the Explorer-first selection sequence and the corrected
post-publish unmount guard, then blocked because no certified browser/CDP context remained.

This package repairs only that environmental prerequisite.

It:
- reuses an existing local Chrome CDP context on port 9333 if present;
- otherwise launches a dedicated local Chrome context against http://127.0.0.1:5173/;
- restores Explorer-first target selection;
- restores intended post-publish Report Review unmount as the success predicate;
- preserves every PDF/runtime/origin guard;
- runs the same exact-three-record cohort strictly sequentially.

Application source mutation OFF.
Governed data mutation OFF.
Network authority OFF.
Pixel evidence OFF.
