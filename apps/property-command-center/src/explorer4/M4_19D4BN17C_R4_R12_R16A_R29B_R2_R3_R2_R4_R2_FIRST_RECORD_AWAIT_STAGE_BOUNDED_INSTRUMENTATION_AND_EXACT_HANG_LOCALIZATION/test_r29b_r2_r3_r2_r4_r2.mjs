import fs from 'node:fs';
const s=fs.readFileSync(new URL('./instrument_and_localize_r29b_r2_r3_r2_r4_r2.py',import.meta.url),'utf8');
const req=['R29B_R4_R2_CDP_CALL_BEGIN','R29B_R4_R2_HELPER_BEGIN','timeout=12','RUNNER_RESTORED_AFTER_DIAGNOSIS','LAST_CDP_CALL_BEGIN','LAST_HELPER_BEGIN','RECORD401_UNSETTLED_AWAIT_LOCALIZED_TO_LAST_ENTERED_CDP_CALL','Governed data mutation: OFF','Export invocation: OFF','Strict sequential: ON','Halt on first failure: ON'];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:'SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R2_STATIC_TEST',status:failed.length?'FAILED':'PASSED',assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);
