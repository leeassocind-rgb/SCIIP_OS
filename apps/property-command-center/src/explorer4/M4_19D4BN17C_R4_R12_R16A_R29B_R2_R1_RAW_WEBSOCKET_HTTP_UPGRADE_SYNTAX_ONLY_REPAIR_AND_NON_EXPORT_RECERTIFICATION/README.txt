R29B-R2-R1 repairs only the syntax defect introduced into the R29B-R2 stdlib WebSocket transport.

Observed Node error:
  SyntaxError: Invalid regular expression flags

Cause:
The generated JS contained a double-escaped regex literal for the HTTP/1.1 101 upgrade response. The slash after HTTP was therefore parsed as the regex terminator.

Repair:
Replace only that regex test with:
  String(lines[0]||"").startsWith("HTTP/1.1 101")

The already-installed RawWebSocket transport, masked frames, large-frame handling, ping/pong handling, fresh-page policy, strict sequential policy, halt-on-first-failure policy, and Export-OFF contract are preserved.
