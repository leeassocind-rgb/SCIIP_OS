import React from'react';
import{liveGovernedPropertyBadge}from'./LiveGovernedPropertyIntelligence.js';
import{buildReconciliationPresentation}from'./LiveGovernedReconciliationPresentation.js';
import VerifiedParcelIntelligenceCard from'./VerifiedParcelIntelligenceCard.jsx';
import VerifiedParcelSynthesisCard from'./VerifiedParcelSynthesisCard.jsx';
import PropertyIntelligenceProvenanceCard from'./PropertyIntelligenceProvenanceCard.jsx';
import GovernedAttributeResolutionCard from'./GovernedAttributeResolutionCard.jsx';
import GovernedApprovalWorkflowCard from'./GovernedApprovalWorkflowCard.jsx';
import CanonicalExecutionHistoryCard from'./CanonicalExecutionHistoryCard.jsx';
import DecisionLifecycleCard from'./DecisionLifecycleCard.jsx';
import GovernedPropertyStateCard from'./GovernedPropertyStateCard.jsx';
import GovernedPropertyCommandStateCard from'./GovernedPropertyCommandStateCard.jsx';
import{buildGovernedPropertyReadModel}from'./GovernedPropertyReadModel.js';
import{buildCanonicalPropertyProjection}from'./CanonicalPropertyProjection.js';
import{buildGovernedPropertyTruthContractFromProjection}from'./GovernedPropertyTruthContract.js';
import{buildGovernedPropertyRuntimeBoundary}from'./GovernedPropertyRuntimeBoundary.js';
import GovernedPropertyRuntimeBoundaryCard from'./GovernedPropertyRuntimeBoundaryCard.jsx';
import GovernedPropertyTruthContractCard from'./GovernedPropertyTruthContractCard.jsx';
import CanonicalPropertyProjectionCard from'./CanonicalPropertyProjectionCard.jsx';
import GovernedPropertyReadModelCard from'./GovernedPropertyReadModelCard.jsx';
import IntelligenceQualityCard from'./IntelligenceQualityCard.jsx';
import IntelligenceGapCard from'./IntelligenceGapCard.jsx';
import GovernedIntelligenceAcquisitionCard from'./GovernedIntelligenceAcquisitionCard.jsx';

const fmt=value=>value===null||value===undefined||value===''?'—':value;


function ReconciliationEvidenceAudit({presentation}){
  if(!presentation?.hasEvidenceDetails)return null;
  return <details className="reconciliation-evidence-audit">
    <summary>View reconciliation evidence</summary>
    <div className="reconciliation-evidence-audit__summary">
      <span>Identity {presentation.identityConfidenceLabel}</span>
      <span>Source {presentation.sourceConfidenceLabel}</span>
      <span>{presentation.resolvedRepresentations} normalized</span>
      <span>{presentation.unresolvedEvidenceConflicts} review</span>
    </div>
    {presentation.conflictDetails?.length>0?
      <div className="reconciliation-evidence-audit__rows">
        {presentation.conflictDetails.map(item=><div className="reconciliation-evidence-audit__row" key={item.id}>
          <div><strong>{item.field}</strong><span>{String(item.domain||'evidence').replaceAll('_',' ')}</span></div>
          <div><span>SCIIP</span><strong>{item.sciipValue==null?'—':String(item.sciipValue)}</strong></div>
          <div><span>LightBox</span><strong>{item.externalValue==null?'—':String(item.externalValue)}</strong></div>
          <em>{String(item.disposition||'review').replaceAll('_',' ')}</em>
        </div>)}
      </div>
      :<p>Evidence differences were detected, but this response does not expose field-level detail. Open Evidence for the governed source comparison.</p>}
  </details>;
}

export default function LiveGovernedPropertyCard({model}){
  const presentation=buildReconciliationPresentation(model,model?.property||null);
  const badge=liveGovernedPropertyBadge(model);
  const governedReadModel=buildGovernedPropertyReadModel(model?.property||model,model);
  const canonicalProjection=buildCanonicalPropertyProjection(governedReadModel,model);
  const governedTruth=buildGovernedPropertyTruthContractFromProjection(canonicalProjection);
  const governedRuntime=buildGovernedPropertyRuntimeBoundary(canonicalProjection);
  const governedModel={...model,property:governedRuntime.property,governedReadModel,canonicalProjection,governedTruth,governedRuntime};
  return <div className="explorer3__live-governed">
    <div className="explorer3__live-governed-head">
      <div>
        <span>LIVE GOVERNED INTELLIGENCE</span>
        <strong>SCIIP × LightBox Parcel Resolution</strong>
      </div>
      <em className={`is-${badge.tone}`}>{badge.label}</em>
    </div>

    <div className="explorer3__live-governed-grid">
      <div><span>Canonical</span><strong>{model?.canonicalVerified?'VERIFIED':'REVIEW'}</strong></div>
      <div><span>Parcel Match</span><strong>{fmt(model?.resolutionStatus)}</strong></div>
      <div><span>Identity Confidence</span><strong>{presentation.identityConfidenceLabel}</strong><small>Source {presentation.sourceConfidenceLabel}</small></div>
      <div><span>APN</span><strong>{fmt(model?.matchedApn)}</strong></div>
      <div><span>Identity Conflicts</span><strong>{presentation.identityConflictLabel}</strong><small>{presentation.identityConflicts===0?"Identity clean":"Review identity"}</small></div><div><span>Evidence Differences</span><strong>{presentation.evidenceConflictLabel}</strong><small>{presentation.resolvedRepresentations} normalized · {presentation.unresolvedEvidenceConflicts} review</small></div>
      <div><span>Response</span><strong>{model?.liveEnabled?(model?.cacheHit?'CACHED':'LIVE'):'OFFLINE'}</strong></div>
      <div><span>Temporal</span><strong>{model?.temporalMode==='PROJECT_FUTURE_STATE'?'FUTURE':'CURRENT'}</strong></div>
    </div>

    <p>
      {model?.temporalMode==='PROJECT_FUTURE_STATE'
        ? 'Project / Future State: SCIIP describes the development program. LightBox assessor and parcel evidence may describe the current or pre-development condition and is not treated as a silent overwrite.'
        : model?.verifiedMatch
        ? 'LightBox is attached as verified enrichment evidence. SCIIP remains canonical and no governed identity field is overwritten.'
        : model?.liveEnabled
          ? 'SCIIP is resolving the selected property against the verified LightBox Parcel contract.'
          : 'Configure the secure LightBox server proxy to activate live parcel enrichment.'}
    </p>{presentation.hasEvidenceDetails&&<ReconciliationEvidenceAudit presentation={presentation}/>}<VerifiedParcelIntelligenceCard model={model}/><VerifiedParcelSynthesisCard model={model}/><PropertyIntelligenceProvenanceCard model={model}/><GovernedAttributeResolutionCard model={model}/><GovernedApprovalWorkflowCard property={model?.property||model}/><CanonicalExecutionHistoryCard property={model?.property||model}/><DecisionLifecycleCard property={model?.property||model} model={model}/><GovernedPropertyCommandStateCard property={model?.property||model} model={model}/><GovernedPropertyReadModelCard property={model?.property||model} model={model}/><CanonicalPropertyProjectionCard property={model?.property||model} model={model}/><GovernedPropertyTruthContractCard property={model?.property||model} model={model}/><GovernedPropertyRuntimeBoundaryCard property={model?.property||model} model={model}/><IntelligenceQualityCard property={governedRuntime.property} model={governedModel}/><IntelligenceGapCard property={governedRuntime.property} model={governedModel}/>
      <GovernedIntelligenceAcquisitionCard property={governedRuntime.property} gaps={governedModel?.intelligenceGaps?.gaps||model?.intelligenceGaps?.gaps} /><GovernedPropertyStateCard property={governedRuntime.property} model={governedModel}/>
  </div>;
}
