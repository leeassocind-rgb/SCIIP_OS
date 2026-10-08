Consumes R5-R1-R4's exact diagnosis:
WEBSOCKET_FRAME_RECEIVE_PATH_PRESENT_BUT_CDP_JSON_DECODE_ABSENT

This narrowly adds a post-upgrade inbound RFC6455 server-frame decoder,
CDP JSON parsing, and response-id -> pending Promise resolution to the
authoritative R29B raw-socket CDP transport, then reruns authoritative R29B.

Governed data mutation OFF. Export invocation OFF.
Strict sequential ON. Halt on first failure ON.
