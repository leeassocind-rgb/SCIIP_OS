const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..');
const code=fs.readFileSync(path.join(root,'src/applications/ai-copilot/SCIIP_V8_AI_Copilot_Application.gs'),'utf8');
const sandbox={console,JSON,Object,Array,Error};vm.createContext(sandbox);vm.runInContext(code,sandbox);
const result=sandbox.sciipTestV8Sprint9AiCopilotGuidedDecisionWorkspaceSource();
if(!result||result.status!=='PASSED'){console.error(JSON.stringify(result,null,2));process.exit(1);}
console.log(JSON.stringify(result,null,2));