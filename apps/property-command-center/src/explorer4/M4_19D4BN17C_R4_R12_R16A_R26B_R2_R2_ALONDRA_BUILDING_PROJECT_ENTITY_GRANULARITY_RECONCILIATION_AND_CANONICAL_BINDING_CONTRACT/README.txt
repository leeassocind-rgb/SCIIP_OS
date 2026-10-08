SCIIP Explorer 4.0 — R26B-R2-R2
Alondra Building/Project Entity Granularity Reconciliation + Canonical Binding Contract

Purpose
-------
Correct the prior duplicate-address interpretation using user-provided site-plan evidence.

Source facts
------------
Building 1
- 112 W Alondra Blvd, Carson, CA
- 181,831 SF

Building 2
- 219 W Gardena Blvd, Carson, CA
- 102,083 SF

Building 3
- 16325 S Main St, Carson, CA
- 138,363 SF

181,831 + 102,083 + 138,363 = 422,277 SF.

Therefore:
- 181,831 SF = Building 1 entity
- 422,277 SF = three-building project aggregate
- the aggregate must NOT be treated as a second standalone 112 W Alondra building

Canonical binding contract
--------------------------
Building 1:
112 W Alondra Blvd|181831

Project aggregate:
ALONDRA_THREE_BUILDING_PROJECT|422277

Relationship:
PROJECT_AGGREGATE HAS_BUILDING BUILDING
BUILDING MEMBER_OF_PROJECT PROJECT_AGGREGATE

Address-only binding is forbidden whenever multiple entity granularities are present.

Authority
---------
Read-only reconciliation only.
No property click.
No Assignments.
No Generate.
No Export.
No application-source mutation.
No governed-data mutation.

On certification:
R26B-R2-R3 Building/Project-Aware Alondra Non-Export Recertification.
