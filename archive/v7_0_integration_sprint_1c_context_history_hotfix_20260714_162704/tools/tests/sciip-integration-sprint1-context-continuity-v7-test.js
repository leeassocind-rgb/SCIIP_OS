const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..');
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
const required=['src/ui/SCIIP_ContextContinuity.gs','src/ui/SCIIP_ContextContinuityClient.html','src/ui/SCIIP_Integration_Tests.gs','src/ui/SCIIP_UI_Shell.html'];
const failures=[];required.forEach(f=>{if(!fs.existsSync(path.join(root,f)))failures.push('Missing '+f)});
if(!failures.length){
 const src=read('src/ui/SCIIP_ContextContinuity.gs');
 ['SCIIP_CONTEXT_CONTINUITY','function sciipContextBackV7','function sciipContextForwardV7','function sciipContextDeepLinkV7','MAX_HISTORY = 50'].forEach(x=>{if(!src.includes(x))failures.push('Missing contract '+x)});
 const tests=read('src/ui/SCIIP_Integration_Tests.gs');
 ['sciipTestV7ContextHistory','sciipTestV7ContextDeepLinkRoundTrip','sciipTestV7ContextRestore','sciipTestV7IntegrationSprint1ContextContinuity'].forEach(x=>{if(!tests.includes(x))failures.push('Missing test '+x)});
 const shell=read('src/ui/SCIIP_UI_Shell.html');
 ['contextBackButton','contextForwardButton','contextShareButton','SCIIP_ContextContinuityClient'].forEach(x=>{if(!shell.includes(x))failures.push('Shell missing '+x)});
 try{new vm.Script(src.replace(/SCIIP_CONTEXT_CONTINUITY\.wire\(\);/,'').replace(/function sciipContext[\s\S]*$/,''));}catch(e){failures.push('Server syntax: '+e.message)}
}
const out={framework:'SCIIP_V7_INTEGRATION_SPRINT_1_CONTEXT_CONTINUITY_NODE_TEST',status:failures.length?'FAILED':'PASSED',failures};console.log(JSON.stringify(out));if(failures.length)process.exit(1);
