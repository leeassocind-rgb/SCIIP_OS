SCIIP Explorer 4.0 — M4.19D4BN17A-R1
Self-Contained CDP WebSocket + 50-Record Live-Searchable Identity Preauthorization

Repairs BN17A's external Python websocket dependency regression.

Observed failure:
ModuleNotFoundError("No module named 'websocket'")

R1:
- removes the external websocket dependency
- reuses the self-contained CDP WebSocket pattern already proven in BN8B-R3, BN9B-R2, BN11B-R2, BN12B, BN13B, BN15A and BN16C family work
- preserves the certified BN16D 25-record reference cohort
- qualifies 25 additional identities against the live Explorer surface
- deterministically selects exactly 25 new records
- preauthorizes exactly 50 total
- performs no application-source or governed-data mutation
