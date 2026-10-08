SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R16A-R1-R2
WebSocket Handshake CRLF Repair + Export/Presentation Control Target Diagnosis

R1-R1 corrected the CDP WebSocket URL port parser.
R1-R2 corrects the remaining transport defect: the HTTP Upgrade request and response
terminator were using literal backslash-r/backslash-n characters instead of CRLF bytes.

All Export/Presentation diagnostic logic is preserved.
Export/Presentation execution authority remains OFF.
