# SCIIP Governed Data Plane — R140

This directory is the initial governed data-plane scaffold for SCIIP.

## Governing rules

1. AIR base inventory is the physical-universe authority.
2. Supersheets are immutable daily observation/change feeds.
3. Absence from a Supersheet is not evidence of withdrawal.
4. Current availability is a reconciliation snapshot.
5. Listing/configuration identity is separate from physical asset identity.
6. Marketed SF, unique available SF, and vacant SF are distinct.
7. Missing is not zero.
8. Comparable transactions do not independently mutate current availability.
9. Observations/events are append-only.
10. Effective state is derived and replay must be idempotent.

R140 does not connect to a database, execute SQL, install dependencies,
or ingest/mutate production AIR state.
