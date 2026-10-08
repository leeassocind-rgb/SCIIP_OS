R29B-R2-R3-R2-R4-R3-R5 consumes the exact R4-R3-R4 finding:

createFreshPage() enters,
httpJson(PUT /json/new) completes,
but await c.open() never returns.

The repair is intentionally narrow. It preserves the existing CDP raw-WebSocket implementation and wraps only c.open() in a timer-backed Promise.race with a 2,000 ms explicit rejection path and guaranteed timer cleanup.

Purpose:
- prevent Node top-level-await exit 13 from an indefinitely unsettled c.open promise;
- allow the existing open transport to succeed normally if it settles;
- otherwise surface an explicit R29B_CDP_OPEN_TIMEOUT_2000MS failure for the next causal repair.

Governed data mutation OFF.
Export invocation OFF.
Strict sequential ON.
Halt on first failure ON.
