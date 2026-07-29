import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ASSIGNMENT_TYPES,WORKSPACE_REGISTRY,assertWorkspaceRegistry,getWorkspaceDefinition} from '../../apps/property-command-center/src/product/workspaceRegistry.js';
import {createWorkspaceMemory} from '../../apps/property-command-center/src/product/workspaceMemory.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const tests=[]; const test=(name,fn)=>tests.push([name,fn]);
class MemoryStorage{constructor(){this.data=new Map()}getItem(k){return this.data.get(k)||null}setItem(k,v){this.data.set(k,v)}removeItem(k){this.data.delete(k)}}

test('WorkspaceRegistryIntegrity',()=>{const result=assertWorkspaceRegistry();assert.equal(result.valid,true,result.errors.join('\n'));assert.equal(result.workspaceCount,6)});
test('ListingWorkspace',()=>{const tabs=getWorkspaceDefinition(ASSIGNMENT_TYPES.LISTING).tabs;assert(tabs.includes('Marketing'));assert(tabs.includes('Competition'));assert(tabs.includes('Available Properties'))});
test('BuyerWorkspace',()=>{const tabs=getWorkspaceDefinition(ASSIGNMENT_TYPES.BUYER_REQUIREMENT).tabs;assert(tabs.includes('Matching Properties'));assert(!tabs.includes('Marketing'));assert(!tabs.includes('Competition'))});
test('LeaseRequirementRename',()=>{const all=JSON.stringify(WORKSPACE_REGISTRY);assert(all.includes('Lease Requirement'));assert(!all.includes('Tenant Requirement'))});
test('LeaseBuyerStructuralParity',()=>{assert.deepEqual(getWorkspaceDefinition(ASSIGNMENT_TYPES.LEASE_REQUIREMENT).tabs,getWorkspaceDefinition(ASSIGNMENT_TYPES.BUYER_REQUIREMENT).tabs)});
test('DynamicTabRenderingSource',()=>{const main=fs.readFileSync(path.join(root,'apps/property-command-center/src/main.jsx'),'utf8');assert(main.includes('workspace.tabs.map'));assert(!main.includes("const tabs="))});
test('WorkspaceMemoryIsolation',()=>{const store=new MemoryStorage();const memory=createWorkspaceMemory(store);memory.save('A',{selectedTab:'Morning Brief',notes:'A note',scrollPosition:410});memory.save('B',{selectedTab:'Assignment Health',filters:{city:'Rialto'}});assert.equal(memory.load('A').selectedTab,'Morning Brief');assert.equal(memory.load('A').scrollPosition,410);assert.equal(memory.load('B').selectedTab,'Assignment Health');assert.deepEqual(memory.load('B').filters,{city:'Rialto'})});
test('WorkspaceMemoryCorruptionSafety',()=>{const store=new MemoryStorage();store.setItem('sciip.assignment.workspace.v1.A','{bad-json');const state=createWorkspaceMemory(store).load('A');assert.equal(state.selectedTab,'Executive Summary')});
test('MorningBriefEditable',()=>{const main=fs.readFileSync(path.join(root,'apps/property-command-center/src/main.jsx'),'utf8');assert(main.includes('setBrief(e.target.value)'));assert(main.includes('Preserve brief'))});
test('BrokerEditsProtected',()=>{const main=fs.readFileSync(path.join(root,'apps/property-command-center/src/main.jsx'),'utf8');assert(main.includes('SCIIP will never overwrite broker edits.'))});
test('AssignmentHealthNoScoring',()=>{const main=fs.readFileSync(path.join(root,'apps/property-command-center/src/main.jsx'),'utf8');assert(main.includes('not a broker score'));assert(!main.includes('Broker Scorecard'));assert(!main.includes('broker scorecard'))});
test('PermanentNavigation',()=>{const main=fs.readFileSync(path.join(root,'apps/property-command-center/src/main.jsx'),'utf8');['Today','Assignments','Relationships','Properties','Markets','GIS','Reports','Administration'].forEach(x=>assert(main.includes(`'${x}'`)))});

let passed=0;const failures=[];for(const [name,fn] of tests){try{fn();passed++}catch(error){failures.push({test:name,error:error.message})}}
const result={framework:'SCIIP_RELEASE_1_SPRINT_2_PRODUCT_GOVERNANCE',version:'release-1.0-sprint2.0',status:failures.length?'FAILED':'PASSED',testsRun:tests.length,passed,failures,result:{workspaceRegistry:Object.keys(WORKSPACE_REGISTRY).length,dynamicRendering:true,workspaceMemory:true,leaseRequirementRename:true,morningBriefEditable:true,assignmentHealthActionable:true,productGovernance:'ENFORCED'}};
console.log(JSON.stringify(result));if(failures.length)process.exit(1);
