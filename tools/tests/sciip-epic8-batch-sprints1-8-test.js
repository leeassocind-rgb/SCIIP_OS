const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../../src/applications/enterprise-data-fabric');
const ctx={Logger:{log:()=>{}},console};vm.createContext(ctx);
fs.readdirSync(root).filter(f=>f.startsWith('SCIIP_Epic8_')&&f.endsWith('.gs')).sort().forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f}));
const tests=['sciipTestV7Epic8SuperSheetIngestionRegistryBatchIntake','sciipTestV7Epic8SchemaMappingCanonicalization','sciipTestV7Epic8DataQualityValidationQuarantine','sciipTestV7Epic8EntityResolutionMasterData','sciipTestV7Epic8EventGenerationIdempotentLedger','sciipTestV7Epic8KnowledgeGraphSynchronization','sciipTestV7Epic8ContinuousIntelligenceRefresh','sciipTestV7Epic8EnterpriseDataFabricSuperSheetContinuousIntelligenceReleaseCertification'];
let failures=[];for(const t of tests){if(typeof ctx[t]!=='function'){failures.push(t+':MISSING');continue;}const r=ctx[t]();if(r.status!=='PASSED')failures.push(t+':'+r.status);}
const final=ctx[tests[tests.length-1]]();const out={framework:'SCIIP_V7_EPIC8_BATCH_SPRINTS1_8',version:'v7.0-epic8-batch.0',status:failures.length?'FAILED':'PASSED',testsRun:tests.length,failures,result:final.result};console.log(JSON.stringify(out));if(failures.length)process.exit(1);
