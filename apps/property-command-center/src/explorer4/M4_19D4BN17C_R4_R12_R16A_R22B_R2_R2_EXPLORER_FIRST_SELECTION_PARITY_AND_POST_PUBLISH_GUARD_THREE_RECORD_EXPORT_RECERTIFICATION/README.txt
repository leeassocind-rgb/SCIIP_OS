SCIIP Explorer 4.0 — R22B-R2-R2

R22B-R2-R1 proved that the post-publish certification guard is now correct, but the
recertification copy still failed before Export because target selection regressed to a
pre-Explorer sequence.

R22A-R3 already certified the exact correct order:
Fresh page -> Explorer -> target selection/readback -> Assignments -> Generate -> Report Review.

R22B-R2-R2 restores that certified Explorer-first selection parity while preserving:
- intended post-publish Report Review unmount as the success condition;
- exactly one PDF download;
- exactly one application/pdf object URL;
- positive PDF size;
- zero runtime errors and unhandled rejections;
- Explorer continuity;
- same-origin continuity;
- strict sequential execution;
- halt on first failure;
- maximum one Export click per record.

Application source remains untouched.
