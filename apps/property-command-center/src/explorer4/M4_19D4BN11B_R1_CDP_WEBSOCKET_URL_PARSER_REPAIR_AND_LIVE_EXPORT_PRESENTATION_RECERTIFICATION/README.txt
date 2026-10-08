SCIIP Explorer 4.0 — M4.19D4BN11B-R1
CDP WebSocket URL Parser Repair + Live Export/Presentation Recertification

WHY R1 EXISTS
-------------
BN11B static certification passed, but the live observer failed before runtime
observation because the WebSocket URL parser used an over-escaped port regex:

    r"ws://([^/:]+):(\\d+)(/.*)"

That searches for a literal backslash followed by d rather than a numeric port.

R1 repairs only the bootstrap parser to:

    r"ws://([^/:]+):(\d+)(/.*)"

The live Export/Presentation observation contract is otherwise unchanged.

No application source mutation.
No governed data mutation.
Pixel evidence OFF.
External websocket dependency OFF.
