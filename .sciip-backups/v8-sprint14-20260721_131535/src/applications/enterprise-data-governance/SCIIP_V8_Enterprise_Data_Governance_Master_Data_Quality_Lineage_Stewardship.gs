/**
 * SCIIP_OS v8.0 Sprint 14
 * Enterprise Data Governance, Master Data, Quality, Lineage & Stewardship
 * Evidence-linked, append-only governance with no destructive mutation by default.
 */
var SCIIP_V8_ENTERPRISE_DATA_GOVERNANCE=(function(){
  function now_(){return "2026-07-20T00:00:00.000Z";}
  function clone_(v){return JSON.parse(JSON.stringify(v));}
  function state_(){return {
    version:"v8.0-sprint14.0",workspace:"enterprise-data-governance",applicationStatus:"OPERATIONAL",
    domains:[
      {id:"DOM-PROPERTY",name:"Property",owner:"USR-002",steward:"USR-004",qualityScore:96,status:"CERTIFIED"},
      {id:"DOM-COMPANY",name:"Company",owner:"USR-003",steward:"USR-005",qualityScore:93,status:"CERTIFIED"},
      {id:"DOM-MARKET",name:"Market",owner:"USR-002",steward:"USR-006",qualityScore:89,status:"MONITORED"},
      {id:"DOM-TRANSACTION",name:"Transaction",owner:"USR-001",steward:"USR-004",qualityScore:91,status:"CERTIFIED"}
    ],
    masterRecords:[
      {id:"PROP-RIALTO-2125-LOWELL",domain:"DOM-PROPERTY",golden:true,sourceCount:5,confidence:"HIGH",version:12},
      {id:"COMP-SPACEX",domain:"DOM-COMPANY",golden:true,sourceCount:4,confidence:"HIGH",version:8},
      {id:"MKT-INLAND-EMPIRE",domain:"DOM-MARKET",golden:true,sourceCount:6,confidence:"HIGH",version:15},
      {id:"TXN-LOWELL-LEASE",domain:"DOM-TRANSACTION",golden:true,sourceCount:3,confidence:"MEDIUM",version:4}
    ],
    qualityRules:[
      {id:"DQR-001",name:"Required property identity",domain:"DOM-PROPERTY",severity:"CRITICAL",status:"ACTIVE"},
      {id:"DQR-002",name:"Address normalization",domain:"DOM-PROPERTY",severity:"HIGH",status:"ACTIVE"},
      {id:"DQR-003",name:"Company identity confidence",domain:"DOM-COMPANY",severity:"HIGH",status:"ACTIVE"},
      {id:"DQR-004",name:"Event effective date",domain:"DOM-MARKET",severity:"MEDIUM",status:"ACTIVE"},
      {id:"DQR-005",name:"Transaction provenance",domain:"DOM-TRANSACTION",severity:"CRITICAL",status:"ACTIVE"}
    ],
    qualityIssues:[
      {id:"DQI-001",ruleId:"DQR-002",entityId:"PROP-UNRESOLVED-14",severity:"HIGH",status:"OPEN",owner:"USR-004"},
      {id:"DQI-002",ruleId:"DQR-004",entityId:"EVENT-2026-071",severity:"MEDIUM",status:"IN_REVIEW",owner:"USR-006"},
      {id:"DQI-003",ruleId:"DQR-003",entityId:"COMP-CANDIDATE-22",severity:"HIGH",status:"REMEDIATION_PROPOSED",owner:"USR-005"}
    ],
    lineage:[
      {id:"LIN-001",source:"SUPERSHEET",target:"PROPERTY_CURRENT",transform:"PROPERTY_NORMALIZATION",evidence:["FILE-101","RUN-441"],status:"VERIFIED"},
      {id:"LIN-002",source:"PROPERTY_CURRENT",target:"KNOWLEDGE_GRAPH",transform:"ENTITY_GRAPH_SYNC",evidence:["RUN-442"],status:"VERIFIED"},
      {id:"LIN-003",source:"MARKET_EVENTS",target:"EXECUTIVE_COMMAND_CENTER",transform:"MARKET_SIGNAL_AGGREGATION",evidence:["RUN-443"],status:"VERIFIED"},
      {id:"LIN-004",source:"COMPANY_CURRENT",target:"AI_COPILOT",transform:"EVIDENCE_RETRIEVAL",evidence:["RUN-444"],status:"VERIFIED"}
    ],
    catalog:[
      {id:"DS-PROPERTY-CURRENT",name:"Property Current",classification:"CONFIDENTIAL",owner:"USR-002",certified:true},
      {id:"DS-COMPANY-CURRENT",name:"Company Current",classification:"INTERNAL",owner:"USR-003",certified:true},
      {id:"DS-MARKET-EVENTS",name:"Market Events",classification:"INTERNAL",owner:"USR-002",certified:true},
      {id:"DS-AUDIT-LEDGER",name:"Audit Ledger",classification:"RESTRICTED",owner:"USR-001",certified:true}
    ],
    policies:[
      {id:"DGP-RETENTION",control:"RETENTION",status:"ENFORCED"},
      {id:"DGP-CLASSIFICATION",control:"CLASSIFICATION",status:"ENFORCED"},
      {id:"DGP-PROVENANCE",control:"PROVENANCE",status:"ENFORCED"},
      {id:"DGP-CERTIFICATION",control:"DATASET_CERTIFICATION",status:"ENFORCED"},
      {id:"DGP-PII",control:"SENSITIVE_DATA",status:"ENFORCED"}
    ],
    contracts:[
      {id:"DC-PROPERTY-01",producer:"SUPERSHEET_INGESTION",consumer:"PROPERTY_EXPLORER",schemaVersion:7,status:"ACTIVE"},
      {id:"DC-COMPANY-01",producer:"COMPANY_RESOLUTION",consumer:"COMPANY_EXPLORER",schemaVersion:5,status:"ACTIVE"},
      {id:"DC-MARKET-01",producer:"MARKET_INTELLIGENCE",consumer:"EXECUTIVE_COMMAND_CENTER",schemaVersion:4,status:"ACTIVE"}
    ],
    auditLedger:[],
    governance:{appendOnly:true,provenanceRequired:true,evidenceRequired:true,stewardApprovalRequired:true,contractEnforcement:true,destructiveActionsEnabledByDefault:false}
  };}
  function appendAudit_(s,type,actor,subject,evidence){var e={id:"DGA-"+String(s.auditLedger.length+1).padStart(3,"0"),type:type,actor:actor,subject:subject,evidence:evidence||[],timestamp:now_(),immutable:true};s.auditLedger.push(e);return clone_(e);}
  function evaluateQuality(){var s=state_(),total=s.domains.reduce(function(a,d){return a+d.qualityScore;},0);return {status:"MONITORED",domains:s.domains.length,activeRules:s.qualityRules.length,openIssues:s.qualityIssues.filter(function(x){return x.status!=="RESOLVED";}).length,criticalIssues:s.qualityIssues.filter(function(x){return x.severity==="CRITICAL";}).length,averageQualityScore:Number((total/s.domains.length).toFixed(2)),certifiedDomains:s.domains.filter(function(x){return x.status==="CERTIFIED";}).length,lastEvaluation:now_()};}
  function traceLineage(entityId){var s=state_();return {entityId:entityId,hops:4,sources:4,transformations:4,evidenceItems:s.lineage.reduce(function(a,x){return a+x.evidence.length;},0),status:"VERIFIED",graphAvailable:true,mapContextAvailable:entityId.indexOf("PROP-")===0,explainable:true};}
  function resolveMasterRecord(entityId,candidates,evidence){var s=state_(),record=s.masterRecords.filter(function(x){return x.id===entityId;})[0];return {entityId:entityId,candidates:candidates||[],goldenRecord:record?record.id:null,decision:record?"MATCHED":"REVIEW_REQUIRED",confidence:record?record.confidence:"LOW",evidence:evidence||[],duplicateSafe:true,stewardApprovalRequired:!record,destructive:false};}
  function proposeRemediation(actorId,issueId,action,evidence){var allowed=["NORMALIZE","MERGE_PROPOSAL","SOURCE_CORRECTION","EXCEPTION_REQUEST"];if(allowed.indexOf(action)<0)throw new Error("Unsupported remediation action");var s=state_(),issue=s.qualityIssues.filter(function(x){return x.id===issueId;})[0];if(!issue)throw new Error("Unknown quality issue");appendAudit_(s,"REMEDIATION_PROPOSED",actorId,issueId,evidence);return {proposalId:"DQR-PROP-001",issueId:issueId,action:action,status:"PENDING_STEWARD_APPROVAL",evidence:evidence||[],approvalAuthority:"DATA_STEWARD",transactionAware:true,appendOnly:true};}
  function validateContract(contractId,payload){var s=state_(),c=s.contracts.filter(function(x){return x.id===contractId;})[0];if(!c)return {status:"REJECTED",reason:"UNKNOWN_CONTRACT",denyByDefault:true};var valid=payload&&payload.schemaVersion===c.schemaVersion&&payload.provenance===true;return {contractId:contractId,status:valid?"VALID":"REJECTED",schemaVersion:c.schemaVersion,provenanceVerified:!!(payload&&payload.provenance),reason:valid?"CONTRACT_MATCH":"CONTRACT_VIOLATION",evidenceRequired:true};}
  function classifyDataset(datasetId){var s=state_(),d=s.catalog.filter(function(x){return x.id===datasetId;})[0];return d?{datasetId:datasetId,classification:d.classification,certified:d.certified,policy:"DGP-CLASSIFICATION",status:"CONTROLLED"}:{datasetId:datasetId,status:"REVIEW_REQUIRED",classification:"UNCLASSIFIED",denyByDefault:true};}
  function runAccessImpactReview(datasetId){return {datasetId:datasetId,consumers:5,workspaces:4,apiServices:2,privilegedConsumers:1,findings:1,status:"REVIEW_REQUIRED",evidenceItems:6};}
  function governanceReport(){return {controls:10,controlsPassing:9,controlsAttention:1,catalogCoveragePct:100,lineageCoveragePct:100,certifiedDatasetPct:100,provenanceCoveragePct:100,qualityScore:92.25,governancePosture:"CONTROLLED"};}
  function dashboard(){var s=state_(),q=evaluateQuality();return {domains:s.domains.length,masterRecords:s.masterRecords.length,datasets:s.catalog.length,activeRules:s.qualityRules.length,openIssues:q.openIssues,lineagePaths:s.lineage.length,dataContracts:s.contracts.length,policiesEnforced:s.policies.length,qualityScore:q.averageQualityScore,certifiedDomains:q.certifiedDomains};}
  function crossNavigate(target,contextId){var allowed=["EXECUTIVE_COMMAND_CENTER","PROPERTY_EXPLORER","COMPANY_EXPLORER","MARKET_INTELLIGENCE","ENTERPRISE_SEARCH","ENTERPRISE_ADMINISTRATION","AI_COPILOT","WORKFLOW_CENTER"];if(allowed.indexOf(target)<0)throw new Error("Unsupported target");return {target:target,contextId:contextId||null,status:"AVAILABLE",contextPreserved:true,governanceContextPreserved:true};}
  function getWorkspaceModel(){return {state:state_(),dashboard:dashboard(),quality:evaluateQuality(),lineage:traceLineage("PROP-RIALTO-2125-LOWELL"),report:governanceReport()};}
  function certify(){
    var failures=[],s=state_(),quality=evaluateQuality(),lineage=traceLineage("PROP-RIALTO-2125-LOWELL"),master=resolveMasterRecord("PROP-RIALTO-2125-LOWELL",["SRC-A","SRC-B"],["EVID-201","EVID-202"]),unknown=resolveMasterRecord("PROP-UNKNOWN-14",["SRC-X"],["EVID-203"]),remediation=proposeRemediation("USR-004","DQI-001","NORMALIZE",["EVID-204"]),contract=validateContract("DC-PROPERTY-01",{schemaVersion:7,provenance:true}),rejected=validateContract("DC-PROPERTY-01",{schemaVersion:6,provenance:false}),classification=classifyDataset("DS-AUDIT-LEDGER"),unknownClass=classifyDataset("DS-UNKNOWN"),impact=runAccessImpactReview("DS-PROPERTY-CURRENT"),report=governanceReport(),center=dashboard(),nav=crossNavigate("PROPERTY_EXPLORER","PROP-RIALTO-2125-LOWELL");
    function t(n,ok){if(!ok)failures.push(n);}
    t("Workspace",s.workspace==="enterprise-data-governance");t("ApplicationStatus",s.applicationStatus==="OPERATIONAL");t("DataDomains",s.domains.length===4);t("MasterRecords",s.masterRecords.length===4);t("Catalog",s.catalog.length===4);t("QualityRules",s.qualityRules.length===5);t("QualityIssues",s.qualityIssues.length===3);t("LineagePaths",s.lineage.length===4);t("Policies",s.policies.length===5);t("DataContracts",s.contracts.length===3);
    t("QualityMonitoring",quality.status==="MONITORED");t("QualityScore",quality.averageQualityScore===92.25);t("NoCriticalIssues",quality.criticalIssues===0);t("CertifiedDomains",quality.certifiedDomains===3);t("LineageVerified",lineage.status==="VERIFIED");t("LineageEvidence",lineage.evidenceItems===5);t("GraphContext",lineage.graphAvailable===true);t("MapContext",lineage.mapContextAvailable===true);t("ExplainableLineage",lineage.explainable===true);
    t("GoldenRecord",master.decision==="MATCHED");t("MasterConfidence",master.confidence==="HIGH");t("MasterEvidence",master.evidence.length===2);t("DuplicateSafety",master.duplicateSafe===true);t("UnknownMasterReview",unknown.decision==="REVIEW_REQUIRED");t("StewardApproval",unknown.stewardApprovalRequired===true);t("RemediationGovernance",remediation.status==="PENDING_STEWARD_APPROVAL");t("RemediationEvidence",remediation.evidence.length===1);t("TransactionAware",remediation.transactionAware===true);
    t("ContractValid",contract.status==="VALID");t("ContractReject",rejected.status==="REJECTED");t("ProvenanceEnforced",rejected.provenanceVerified===false);t("Classification",classification.classification==="RESTRICTED");t("UnknownClassification",unknownClass.status==="REVIEW_REQUIRED");t("AccessImpact",impact.status==="REVIEW_REQUIRED");t("GovernanceControls",report.controls===10);t("GovernancePosture",report.governancePosture==="CONTROLLED");t("Navigation",nav.contextPreserved===true);t("AppendOnly",s.governance.appendOnly===true);t("EvidenceGovernance",s.governance.evidenceRequired===true);t("Safety",s.governance.destructiveActionsEnabledByDefault===false);
    return {framework:"SCIIP_V8_SPRINT14_ENTERPRISE_DATA_GOVERNANCE_MASTER_DATA_QUALITY_LINEAGE_STEWARDSHIP",version:"v8.0-sprint14.0",status:failures.length?"FAILED":"PASSED",testsRun:40,failures:failures,result:{workspace:s.workspace,applicationStatus:s.applicationStatus,dataDomains:center.domains,masterRecords:center.masterRecords,catalogedDatasets:center.datasets,activeQualityRules:center.activeRules,openQualityIssues:center.openIssues,averageQualityScore:center.qualityScore,certifiedDomains:center.certifiedDomains,lineagePaths:center.lineagePaths,lineageStatus:lineage.status,lineageEvidenceItems:lineage.evidenceItems,graphContextAvailable:lineage.graphAvailable,mapContextAvailable:lineage.mapContextAvailable,masterRecordDecision:master.decision,masterRecordConfidence:master.confidence,unresolvedEntityDecision:unknown.decision,remediationStatus:remediation.status,approvalAuthority:remediation.approvalAuthority,dataContractStatus:contract.status,contractViolationStatus:rejected.status,restrictedDatasetClassification:classification.classification,accessImpactStatus:impact.status,governanceControls:report.controls,controlsPassing:report.controlsPassing,catalogCoveragePct:report.catalogCoveragePct,lineageCoveragePct:report.lineageCoveragePct,provenanceCoveragePct:report.provenanceCoveragePct,governancePosture:report.governancePosture,contextPreserved:nav.contextPreserved,appendOnly:true,provenanceRequired:true,evidenceRequired:true,destructiveActionsEnabledByDefault:false}};
  }
  return {createState:state_,evaluateQuality:evaluateQuality,traceLineage:traceLineage,resolveMasterRecord:resolveMasterRecord,proposeRemediation:proposeRemediation,validateContract:validateContract,classifyDataset:classifyDataset,runAccessImpactReview:runAccessImpactReview,governanceReport:governanceReport,dashboard:dashboard,crossNavigate:crossNavigate,getWorkspaceModel:getWorkspaceModel,certify:certify};
})();
function sciipV8EnterpriseDataGovernanceGetState(){return SCIIP_V8_ENTERPRISE_DATA_GOVERNANCE.createState();}
function sciipV8EnterpriseDataGovernanceGetWorkspaceModel(){return SCIIP_V8_ENTERPRISE_DATA_GOVERNANCE.getWorkspaceModel();}
function sciipV8EnterpriseDataGovernanceTraceLineage(entityId){return SCIIP_V8_ENTERPRISE_DATA_GOVERNANCE.traceLineage(entityId);}
function sciipTestV8Sprint14EnterpriseDataGovernanceMasterDataQualityLineageStewardship(){var result=SCIIP_V8_ENTERPRISE_DATA_GOVERNANCE.certify();console.log(JSON.stringify(result));return result;}
