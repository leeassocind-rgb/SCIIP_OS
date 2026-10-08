SCIIP Explorer 4.0 — M4.19D4BN5B-R1
Search Session Handoff Causal Reconciliation

WHY THIS EXISTS
BN5B did not expose a spatial/map failure. All ten records showed:
- controlled React value: true
- Explorer mounted: true
- map visible: true
- selected signals: 4
- marker signals: 1
- Property drawer visible: true
- Neighbors drawer visible: true
- map remained visible after downstream interaction

The sole blocker was sessionStorage.sciip.globalSearchQuery remaining populated.

R1 determines whether that residual session value is:
A) evidence that the Explorer consumer failed to execute/consume the handoff, or
B) a stale broker handoff artifact after the selected/focused runtime pathway already executed.

This is READ-ONLY evidence reconciliation.
No source mutation. No governed-data mutation. No network authority. No pixel evidence.
