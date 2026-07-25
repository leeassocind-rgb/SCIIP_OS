const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..'); const ctx={console,Date,Math,JSON,isFinite,Logger:{log:()=>{}}}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,"src/applications/enterprise-digital-twin/SCIIP_Epic7_Sprint1_Enterprise_Digital_Twin_Registry.gs"),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,"src/applications/enterprise-digital-twin/SCIIP_Epic7_Sprint2_Cross_Workspace_Event_Synchronization_Fabric.gs"),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,"src/applications/enterprise-digital-twin/SCIIP_Epic7_Sprint3_Autonomous_Monitoring_Anomaly_Detection.gs"),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,"src/applications/enterprise-digital-twin/SCIIP_Epic7_Sprint4_Predictive_Operational_Simulation.gs"),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,"src/applications/enterprise-digital-twin/SCIIP_Epic7_Sprint5_Enterprise_Command_Playbooks.gs"),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,"src/applications/enterprise-digital-twin/SCIIP_Epic7_Sprint6_Governed_Autonomous_Execution.gs"),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,"src/applications/enterprise-digital-twin/SCIIP_Epic7_Sprint7_Release_Certification.gs"),'utf8'),ctx);

const names=["sciipTestV7Epic7EnterpriseDigitalTwinRegistry", "sciipTestV7Epic7CrossWorkspaceEventSynchronizationFabric", "sciipTestV7Epic7AutonomousMonitoringAnomalyDetection", "sciipTestV7Epic7PredictiveOperationalSimulation", "sciipTestV7Epic7EnterpriseCommandPlaybooks", "sciipTestV7Epic7GovernedAutonomousExecution", "sciipTestV7Epic7EnterpriseDigitalTwinAutonomousOperationsReleaseCertification"]; let failed=[]; for(const n of names){const r=ctx[n](); if(r.status!=='PASSED') failed.push({n,r});} if(failed.length){console.error(JSON.stringify(failed,null,2));process.exit(1);} console.log(JSON.stringify({framework:'SCIIP_V7_EPIC7_BATCH_SPRINTS1_7',status:'PASSED',tests:names.length,release:ctx[names[names.length-1]]().result},null,2));
