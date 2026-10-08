SCIIP Explorer 4.0 — M4.19D4BN16A
25-Record Candidate Selection, Qualification & Preauthorization

Purpose:
Select and qualify a deterministic bounded cohort of 25 governed records for the
next read-only Explorer expansion phase.

Requirements:
- BN16 PASSED
- preserve the original exact-ten cohort
- add exactly 15 deterministic candidates
- select only from governed Explorer/search evidence already present in repository
- no application-source mutation
- no governed-data mutation
- no network authority
- no live execution yet
- emit the exact 25-record cohort for the next certification milestone

Selection policy:
1. Preserve the original ten in original order.
2. Discover candidate property labels from prior Explorer evidence JSON.
3. Exclude duplicates and the original ten.
4. Sort remaining candidates deterministically by normalized label.
5. Take the first 15 qualified candidates.
6. Require exactly 25 total records before preauthorization passes.
