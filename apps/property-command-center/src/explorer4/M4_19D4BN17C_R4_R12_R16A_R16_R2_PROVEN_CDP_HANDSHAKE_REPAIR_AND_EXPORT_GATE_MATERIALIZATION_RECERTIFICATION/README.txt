SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R16A-R16-R2
Proven CDP Handshake Repair + Export Gate Materialization Recertification

R16-R1 removed the external websocket dependency but Chrome reset the HTTP Upgrade handshake.
R16-R2 changes only the CDP transport handshake to the pattern already used successfully in the
R12/R14 SCIIP lineage: Host + Upgrade + Connection + Sec-WebSocket-Key + Sec-WebSocket-Version,
with no Origin header.

The R15 selected-property + workspace gate hypothesis is unchanged and remains untested until
this transport succeeds. Application source mutation OFF. Governed data mutation OFF.
Export is not invoked.
