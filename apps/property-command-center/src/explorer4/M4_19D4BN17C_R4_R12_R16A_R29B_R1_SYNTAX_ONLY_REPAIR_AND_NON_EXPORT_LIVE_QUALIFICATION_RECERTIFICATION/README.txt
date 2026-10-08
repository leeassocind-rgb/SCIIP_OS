R29B-R1 repairs only the diagnosed ECMAScript grammar error in the authoritative R29B runner.

Cause:
JavaScript forbids mixing ?? with || without explicit parentheses:
  sfFromKey(sk) ?? Number(target.sf||0) || null

Repair:
  sfFromKey(sk) ?? (Number(target.sf||0) || null)

The package runs `node --check` before re-invoking the authoritative R29B workflow.
No governed data mutation or Export invocation is introduced.
