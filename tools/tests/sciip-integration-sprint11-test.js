'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..');
const registry={},queries={},services={};
const context={console,Date,JSON,Math,Object,Array,String,Number,Error,isFinite,
 SCIIP_APP_STATE:{},SCIIP_APP_EVENTS:{},
 SCIIP_PLATFORM_REGISTRY:{register:d=>{registry[d.id]=d;return {status:'REGISTERED'};}},
 SCIIP_PLATFORM_SELF_ASSEMBLY:{assemble:()=>{const d=registry['site-selection-industrial-intelligence'];if(d){queries[d.queries[0]]=true;services[d.services[0]]=true;}return {status:'ASSEMBLED'};}},
 SCIIP_QUERY_ENGINE:{snapshot:()=>({registeredQueries:Object.keys(queries)}),register:n=>{queries[n]=true;}},
 SCIIP_LIVE_RUNTIME:{snapshot:()=>({services:Object.keys(services)}),register:n=>{services[n]=true;}}
};vm.createContext(context);
['SCIIP_Site_Selection_Requirements.gs','SCIIP_Site_Candidate_Registry.gs','SCIIP_Site_Feasibility_Engine.gs','SCIIP_Site_Scoring_Engine.gs','SCIIP_Site_Recommendation_Engine.gs','SCIIP_Site_Selection_Workspace.gs','SCIIP_Site_Selection_Application.gs'].forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,'src/applications/site-selection',f),'utf8'),context,{filename:f}));
vm.runInContext(fs.readFileSync(path.join(root,'src/tests/SCIIP_TestingFramework_v7_IntegrationSprint11.gs'),'utf8'),context);
const result=vm.runInContext('sciipTestV7IntegrationSprint11()',context);
if(result.status!=='PASSED'||result.testsRun!==6)throw new Error(JSON.stringify(result));
const app=vm.runInContext(`SCIIP_SITE_SELECTION_APPLICATION.run({requirements:{id:'LIVE',requiredSf:100000,minimumPowerAmps:2000,maximumOccupancyCost:200000},candidates:[{id:'P-A',availableSf:150000,powerAmps:4000,clearHeight:36,dockDoors:30,occupancyCost:120000,laborScore:85,logisticsScore:90,buildingScore:88,riskScore:8,evidence:['source-1']},{id:'P-B',availableSf:80000,powerAmps:5000,clearHeight:40,dockDoors:40,occupancyCost:100000,laborScore:95,logisticsScore:95,buildingScore:95,riskScore:2}]})`,context);
if(app.status!=='COMPLETED'||app.recommendations.top.candidate.id!=='P-A')throw new Error('End-to-end application failed.');
console.log(JSON.stringify({framework:result.framework,version:result.version,status:'PASSED',testsRun:result.testsRun,topCandidate:app.recommendations.top.candidate.id,workspace:app.workspace.workspace.id}));
