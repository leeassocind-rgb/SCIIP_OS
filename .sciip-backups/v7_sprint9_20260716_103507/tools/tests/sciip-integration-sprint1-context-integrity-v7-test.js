const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..'),failures=[];
function read(p){return fs.readFileSync(path.join(root,p),'utf8')}
['src/ui/SCIIP_ContextIntegrity.gs','src/ui/SCIIP_ContextIntegrityClient.html','src/ui/SCIIP_Integration_Sprint1D_Tests.gs'].forEach(f=>{if(!fs.existsSync(path.join(root,f)))failures.push('Missing '+f)});
if(!failures.length){
 const src=read('src/ui/SCIIP_ContextIntegrity.gs');
 ['SCIIP_CONTEXT_INTEGRITY','detectConflict','resolveConflict','reconcile','acknowledgeNotification','dismissNotification','function sciipContextIntegritySnapshotV7'].forEach(x=>{if(!src.includes(x))failures.push('Missing contract '+x)});
 const tests=read('src/ui/SCIIP_Integration_Sprint1D_Tests.gs');
 ['sciipTestV7ContextIntegrityValidation','sciipTestV7ContextConflictResolution','sciipTestV7NotificationLifecycle','sciipTestV7IntegrationSprint1FullCertification'].forEach(x=>{if(!tests.includes(x))failures.push('Missing test '+x)});
 try{new vm.Script(src);}catch(e){failures.push('Server syntax: '+e.message)}
}
const out={framework:'SCIIP_V7_INTEGRATION_SPRINT_1_CONTEXT_INTEGRITY_NODE_TEST',status:failures.length?'FAILED':'PASSED',failures};console.log(JSON.stringify(out));if(failures.length)process.exit(1);
