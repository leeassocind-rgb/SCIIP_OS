import fs from "node:fs";
const s=fs.readFileSync(new URL("./repair_r29a_r2.py",import.meta.url),"utf8");
const req=[
"apps/property-command-center",
"npm\",\"run\",name",
"--host\",\"127.0.0.1",
"--port\",\"5173",
"SCIIP_APP_READY_AFTER_BOOTSTRAP",
"remote-debugging-port={PORT}",
"CDP_AVAILABLE_AFTER_REATTACHMENT",
"CDP_APP_PAGE_ATTACHED",
"select_r29a.py",
"selectorReusedWithoutMutation",
"r29aStatusPassed",
"Property click: OFF",
"Assignments invocation: OFF",
"Generate invocation: OFF",
"Export invocation: OFF",
"R29B_FOUR_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
];
const failed=req.filter(x=>!s.includes(x));
console.log(JSON.stringify({framework:"SCIIP_EXPLORER_4_R29A_R2_STATIC_TEST",status:failed.length?"FAILED":"PASSED",assertions:req.length,failed},null,2));
process.exit(failed.length?1:0);
