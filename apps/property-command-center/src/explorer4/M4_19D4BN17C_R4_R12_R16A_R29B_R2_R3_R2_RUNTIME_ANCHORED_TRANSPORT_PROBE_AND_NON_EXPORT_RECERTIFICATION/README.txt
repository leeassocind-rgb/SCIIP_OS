R29B-R2-R3-R2 fixes the diagnostic blind spot from R29B-R2-R3-R1, which failed on its first fetch before app/CDP state could be captured.

This milestone:
- syntax-checks the already repaired R29B runner,
- bootstraps Property Command Center if 5173 is down,
- verifies CDP 9333,
- creates exactly one fresh app page,
- certifies raw RFC6455 WebSocket handshake,
- certifies Runtime.enable,
- certifies Page.enable,
- certifies one read-only Runtime.evaluate,
- closes the probe page,
- only then reruns authoritative R29B unchanged.

During the probe: Explorer, property selection, Assignments, Generate, and Export remain OFF.
Authoritative R29B itself remains Export-OFF.
