#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');const repo=path.resolve(__dirname,'..','..');
const deps=[path.join(repo,'src','platform','ai','SCIIP_AI_Runtime_Health_Certification.gs'),path.join(repo,'manifests','SCIIP_V7_EPIC4_AI_RUNTIME_MILESTONE.json')];
if(!deps.some(fs.existsSync)){console.error(JSON.stringify({framework:'SCIIP_V7_EPIC_4_DIGITAL_TWIN_RUNTIME_MILESTONE',status:'FAILED',reason:'EPIC4_AI_RUNTIME_REQUIRED'}));process.exit(1);}
const base=path.join(repo,'src','platform','digital-twin');const files=["SCIIP_Digital_Twin_State_Registry.gs", "SCIIP_Digital_Twin_Temporal_Versioning.gs", "SCIIP_Digital_Twin_Spatial_Synchronization.gs", "SCIIP_Digital_Twin_Change_Propagation.gs", "SCIIP_Digital_Twin_Scenario_Simulation.gs", "SCIIP_Digital_Twin_Prediction_Hooks.gs", "SCIIP_Digital_Twin_Audit_Persistence.gs", "SCIIP_Digital_Twin_Runtime_Health_Certification.gs", "SCIIP_Epic4_Digital_Twin_Runtime_Application.gs", "SCIIP_Epic4_Digital_Twin_Runtime_Tests.gs"];
const context={console,Date,JSON,Math,Number,String,Object,Array,Error,isFinite};vm.createContext(context);for(const f of files){const p=path.join(base,f);if(!fs.existsSync(p))throw new Error('Missing digital twin runtime file: '+f);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:f});}
const result=context.sciipTestV7Epic4DigitalTwinRuntimeMilestone();console.log(JSON.stringify(result));if(result.status!=='PASSED')process.exit(1);
