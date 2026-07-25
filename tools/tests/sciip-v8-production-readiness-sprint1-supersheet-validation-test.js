const fs=require("fs"),vm=require("vm"),path=require("path");
const root=path.resolve(__dirname,"../..");
const file=path.join(root,"src/applications/production-readiness/SCIIP_V8_Production_Readiness_SuperSheet_Validation.gs");
const code=fs.readFileSync(file,"utf8");
const sandbox={console,JSON,Object,Array,Error,String,Number,Set,Math};vm.createContext(sandbox);vm.runInContext(code,sandbox);
const fn="sciipTestV8ProductionReadinessSprint1SuperSheetValidation";
if(typeof sandbox[fn]!=="function"){console.error("Missing public certification function: "+fn);process.exit(1);}
const result=sandbox[fn]();
if(!result||result.status!=="PASSED"||result.testsRun!==60){console.error(JSON.stringify(result,null,2));process.exit(1);}
console.log(JSON.stringify(result,null,2));
