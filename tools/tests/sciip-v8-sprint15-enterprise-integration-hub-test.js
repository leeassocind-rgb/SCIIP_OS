const fs=require("fs"),vm=require("vm"),path=require("path");
const root=path.resolve(__dirname,"../..");
const file=path.join(root,"src/applications/enterprise-integration-hub/SCIIP_V8_Enterprise_Integration_Hub_Connectors_APIs_Webhooks_Synchronization_Governance.gs");
const code=fs.readFileSync(file,"utf8");
const sandbox={console,JSON,Object,Array,Error,String,Number};vm.createContext(sandbox);vm.runInContext(code,sandbox);
const fn="sciipTestV8Sprint15EnterpriseIntegrationHubConnectorsApisWebhooksSynchronizationGovernance";
if(typeof sandbox[fn]!=="function"){console.error("Missing public certification function: "+fn);process.exit(1);}
const result=sandbox[fn]();
if(!result||result.status!=="PASSED"||result.testsRun!==42){console.error(JSON.stringify(result,null,2));process.exit(1);}
console.log(JSON.stringify(result,null,2));