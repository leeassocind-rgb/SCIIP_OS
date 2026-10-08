SCIIP Explorer 4.0 — M4.19D4BN11B-R2
CDP WebSocket Handshake Repair + Live Export/Presentation Recertification

BN11B-R1 fixed URL parsing and resolved:
ws://127.0.0.1:9333/devtools/page/...

The next failure occurred during HTTP WebSocket upgrade. R1 injected:
Origin: http://127.0.0.1

Modern Chrome remote debugging can reject an Origin-bearing DevTools handshake.
R2 uses a standards-compliant CDP WebSocket upgrade without a synthetic Origin
header, captures the response status for diagnostics, and preserves the exact
BN11B Export/Presentation live-observation contract.

Application source mutation: OFF
Governed data mutation: OFF
Pixel evidence: OFF
External websocket dependency: OFF
