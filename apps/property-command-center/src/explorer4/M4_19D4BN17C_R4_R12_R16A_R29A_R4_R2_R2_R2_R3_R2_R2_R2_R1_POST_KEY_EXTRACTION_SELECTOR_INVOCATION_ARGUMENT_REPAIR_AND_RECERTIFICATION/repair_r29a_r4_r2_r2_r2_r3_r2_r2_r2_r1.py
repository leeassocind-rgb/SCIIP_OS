#!/usr/bin/env python3
from pathlib import Path
import sys, subprocess, json

R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    selector=repo/"apps/property-command-center/src/explorer4"/R29A/"select_r29a.py"
    if not selector.exists():
        print("STATUS: BLOCKED")
        print("REASON: authoritative R29A selector not found")
        return 4

    print("SELECTOR_PRESENT: True")
    print("SELECTOR_REPO_ARGUMENT_REQUIRED: True")
    print("SELECTOR_INVOCATION_ARGUMENT_REPAIR: PASS_REPO_ROOT_AS_ARGV1")

    rr=subprocess.run(
        [sys.executable, str(selector), str(repo)],
        cwd=str(selector.parent),
        text=True,
        capture_output=True
    )
    print(rr.stdout, end="")
    print(rr.stderr, end="")

    print("SELECTOR_EXIT_CODE:", rr.returncode)
    return rr.returncode

if __name__=="__main__":
    raise SystemExit(main())
