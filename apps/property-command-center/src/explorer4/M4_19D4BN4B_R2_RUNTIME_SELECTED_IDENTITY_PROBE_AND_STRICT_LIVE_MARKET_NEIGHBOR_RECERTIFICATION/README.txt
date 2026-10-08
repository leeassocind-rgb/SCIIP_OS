SCIIP Explorer 4.0
M4.19D4BN4B-R2
RUNTIME SELECTED IDENTITY PROBE + STRICT LIVE MARKET/NEIGHBOR RECERTIFICATION

BACKGROUND
----------
BN4B substantive consumer checks were healthy for all ten:
- controlled search value matched
- Market Context ribbon visible
- Market drawer visible
- Neighbors drawer visible
- map visible
- positive neighbor signals

BN4B-R1 attempted canonical identity continuity using tokens derived from prior drawer
content. That token derivation admitted generic metric numbers (e.g. 10, 23, 47), so
it is not sufficiently discriminating.

PURPOSE
-------
R2 removes generic token heuristics and probes the live selected property identity
directly from the DOM/runtime-facing UI.

For each exact-ten query it captures BEFORE Market interaction and AFTER Neighbor
interaction:
- selected/active DOM nodes
- aria-label/title text
- data-property-id / data-id / data-selected / data-* attributes
- headings and strong labels
- drawer heading/title text
- map marker/button labels and titles
- address-like strings
- query-address numeric/street tokens
- complete bounded text excerpts

The package then derives a STRICT identity signature using:
1. query-specific street/address tokens, excluding generic metric numbers
2. exact DOM attribute identities where available
3. stable heading/selected-node text shared before and after the Market/Neighbor flow

A record passes only when:
- Search React value matches
- Explorer mounted
- Market ribbon visible
- Market drawer visible
- Neighbors drawer visible
- map visible
- neighbor signals > 0
- a non-generic selected identity anchor is proven before interaction
- the same identity anchor remains proven after Neighbor interaction

NO APPLICATION SOURCE MUTATION.
NO GOVERNED DATA MUTATION.
NO PIXEL EVIDENCE.
