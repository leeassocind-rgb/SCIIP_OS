Repairs the immediate R29A selector recertification invocation defect.

The prior package correctly applied the diagnosed key-extraction repair, but its wrapper launched select_r29a.py without the required repository-root argv[1]. The authoritative selector itself expects sys.argv[1] and therefore raised IndexError before reaching candidate-selection logic.

This package makes no further selector/source mutation. It invokes the already-repaired authoritative R29A selector with the SCIIP_OS repository root as argv[1], preserves all no-export/no-governed-mutation guards, and records whether R29A now certifies.
