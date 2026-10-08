#!/usr/bin/env python3
from pathlib import Path
import ast,re,sys

R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    p=repo/"apps/property-command-center/src/explorer4"/R29A/"select_r29a.py"
    s=p.read_text()
    old="""        _r29a_r4_r2_ids = [marker_identity(x) for x in _r29a_r4_r2_prior]
        _r29a_r4_r2_keys = {norm(x.get('selectionKey') or x.get('label')) for x in _r29a_r4_r2_ids if norm(x.get('selectionKey') or x.get('label'))}
        _r29a_r4_r2_new_ids = [marker_identity(x) for x in new200]
        _r29a_r4_r2_new_keys = {norm(x.get('selectionKey') or x.get('label')) for x in _r29a_r4_r2_new_ids if norm(x.get('selectionKey') or x.get('label'))}
"""
    new="""        # R29A-R4-R2-R2-R2-R3-R2-R2-R2: extract comparison keys directly
        # from the authoritative artifact records. Do not round-trip already
        # normalized identity dictionaries through marker_identity().
        # R28A-R3 keys may carry the historical UI-action prefix "select ";
        # R28A-R4 normalized keys do not. Remove only that certified prefix.
        def _r29a_r4_r2_r2_r2_raw_key(x):
            if not isinstance(x,dict):
                return ''
            k=norm(x.get('selectionKey') or x.get('label'))
            return k[7:] if k.startswith('select ') else k
        _r29a_r4_r2_keys = {_r29a_r4_r2_r2_r2_raw_key(x) for x in _r29a_r4_r2_prior if _r29a_r4_r2_r2_r2_raw_key(x)}
        _r29a_r4_r2_new_keys = {_r29a_r4_r2_r2_r2_raw_key(x) for x in new200 if _r29a_r4_r2_r2_r2_raw_key(x)}
"""
    if new in s:
        print("KEY_EXTRACTION_PATCH_ALREADY_PRESENT: True")
    elif old in s:
        s=s.replace(old,new,1); p.write_text(s)
        print("KEY_EXTRACTION_PATCH_APPLIED: True")
    else:
        print("STATUS: BLOCKED")
        print("REASON: expected diagnosed authoritative key-extraction block not found")
        return 4
    ast.parse(p.read_text())
    print("AST_PARSE_CERTIFIED: True")
    return 0
if __name__=="__main__": raise SystemExit(main())
