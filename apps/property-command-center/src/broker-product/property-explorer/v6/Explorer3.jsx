import * as SCIIPPostgresReact from 'react';
import {
  readPostgresHealth,
  readPostgresAssets,
  readPostgresBuildings,
  readPostgresListings,
} from '../../../services/v5_6/IntelligenceRepository.js';
import { getCertifiedAskingMarketMetricDisclosureBinding } from "../../../explorer4/runtime/MarketAvailabilityRuntimeShadowSidecar.mjs";
import { buildAskingMarketMetricUiDisclosureViewModelV1 } from "../../../explorer4/runtime/AirAskingMarketMetricUiDisclosureViewModelV1.mjs";
// M2.63: Production Evidence Contract Recovery — provenance/source/spatial contract certified.
import React,{useEffect,useMemo,useRef,useState}from'react';
import{ArrowRight,Building2,Check,ChevronDown,ChevronUp,FileText,Layers3,MapPin,Maximize2,Presentation,Search,Sparkles,Users,X}from'lucide-react';
import ExplorerMap from'../maps/ExplorerMap.jsx';
import{buildImmediateNeighbors,buildNeighborIntelligence}from'../v4_3/immediateNeighborEngine.js';
import{buildGovernedNeighborContext,propertySpatialIdentity}from'./governedSpatialEngine.js';
import{useGovernedExplorerData}from'./useGovernedExplorerData.js';
import{buildMarketContext,DEFAULT_MARKET_FILTERS,isPropertyVisibleForMarket,passesMarketFilters,MARKET_RADII}from'./marketContextEngine.js';
import{getExplorerPlugins}from'./ExplorerPluginRegistry.js';
import{useExplorerWorkspace}from'./useExplorerWorkspace.js';
import ExplorerCommandPalette from'./ExplorerCommandPalette.jsx';
import'./explorer3.css';
import'./explorer3-m2-1.css';
import'./explorer3-m2-6-2.css';
import{LIGHTBOX_EXPLORER_ENRICHMENT}from'../integrations/lightbox/LightBoxEnrichmentRegistry.js';
import{useLiveGovernedPropertyIntelligence}from'../integrations/lightbox/useLiveGovernedPropertyIntelligence.js';
import{useLightBoxProxyHealth}from'../integrations/lightbox/useLightBoxProxyHealth.js';
import{resolveGovernedExplorerConsumerRuntime}from'../GovernedExplorerConsumerRuntime.js';
import{resolveGovernedSelectedPropertyMapRuntime}from'../GovernedSelectedPropertyMapRuntime.js';
import{resolveGovernedMarketContextAnchor}from'../GovernedMarketContextAnchor.js';
import{resolveGovernedMarketContextConsumer}from'../GovernedMarketContextConsumer.js';
import{resolveGovernedNeighborRadiusCollection}from'../GovernedNeighborRadiusCollectionRuntime.js';
import{resolveGovernedMarketContextCohort}from'../GovernedMarketContextCohortRuntime.js';
import{buildGovernedMarketContextMetricPresentation}from'../GovernedMarketContextMetricPresentation.js';
import{buildGovernedMarketContextRibbonContract}from'../GovernedMarketContextRibbonContract.js';
import{buildGovernedMarketMetricDetailContract}from'../GovernedMarketMetricDetailContract.js';
import{buildGovernedMarketSpatialHighlightContract}from'../GovernedMarketSpatialHighlightContract.js';
import{resolveGovernedMarketSpatialSelection}from'../GovernedMarketSpatialSelectionContract.js';
import{resolveGovernedPropertyIntelligenceSelection}from'../GovernedPropertyIntelligenceSelectionContract.js';
import{buildGovernedPropertyIntelligencePresentation}from'../GovernedPropertyIntelligencePresentationContract.js';
import{resolveGovernedPropertyIntelligenceDerivedRuntime}from'../GovernedPropertyIntelligenceDerivedRuntime.js';
import{resolveGovernedPropertyIntelligenceEvidenceRuntime}from'../GovernedPropertyIntelligenceEvidenceRuntime.js';
import{useGovernedPropertyIntelligenceActionRefresh}from'../intelligence/useGovernedPropertyIntelligenceActionRefresh.js';
import{beginOptimisticGovernedAction,reconcileGovernedActionExecution}from'../intelligence/GovernedPropertyIntelligenceOptimisticExecution.js';
import{resolveGovernedPropertyIntelligenceActionState}from'../intelligence/GovernedPropertyIntelligenceActionState.js';
import{resolveGovernedPropertyIntelligenceActionControls,isGovernedPropertyIntelligenceActionAllowed,inferGovernedPropertyIntelligenceActionFromControl}from'../intelligence/GovernedPropertyIntelligenceActionControls.js';
import LightBoxConnectionBadge from'../integrations/lightbox/LightBoxConnectionBadge.jsx';
import{buildLiveExternalParcelOverlay}from'../intelligence/LiveExternalParcelOverlay.js';
import LightBoxParcelPanel from'../integrations/lightbox/LightBoxParcelPanel.jsx';
import{useLightBoxReadiness}from'../integrations/lightbox/useLightBoxReadiness.js';
import LightBoxReadinessPanel from'../integrations/lightbox/LightBoxReadinessPanel.jsx';
import LightBoxSourceComparison from'../integrations/lightbox/LightBoxSourceComparison.jsx';
import LiveGovernedPropertyCard from'../intelligence/LiveGovernedPropertyCard.jsx';
import{propertyIntelligenceSnapshot,visibleSections,sectionStatus}from'../intelligence/PropertyIntelligenceModel.js';
import PropertyIntelligenceNavigator from'../intelligence/PropertyIntelligenceNavigator.jsx';
import PropertyMetricRail from'../intelligence/PropertyMetricRail.jsx';
import PropertyIntelligenceSectionHost from'../intelligence/PropertyIntelligenceSectionHost.jsx';

import { resolveGovernedPropertyIntelligenceActionFeedback, governedActionFeedbackLabel } from '../intelligence/GovernedPropertyIntelligenceActionFeedback.js';
import { resolveGovernedActionRecovery, beginGovernedActionRetry, reconcileGovernedActionRetry } from '../intelligence/GovernedPropertyIntelligenceActionRecovery.js';
import { readGovernedRecoverySession, writeGovernedRecoverySession, clearGovernedRecoverySession } from '../intelligence/GovernedPropertyIntelligenceRecoverySession.js';
import { appendGovernedRecoveryAuditEvent, summarizeGovernedRecoveryAudit } from '../intelligence/GovernedPropertyIntelligenceRecoveryAudit.js';
import {buildGovernedRecoveryAuditDiagnostics,formatGovernedRecoveryAuditEvent} from '../intelligence/GovernedPropertyIntelligenceRecoveryDiagnostics.js';
const MODE_LABELS={analyze:'Analyze',present:'Present',command:'Command'};
const DEFAULT_VISIBILITY={base:true,available:true,comparable:true,supersheet:true};
const VISIBILITY_LABELS={base:'Base Inventory',available:'Available',comparable:'Comparables',supersheet:'SuperSheet'};

import {buildGovernedRecoveryEventInspection,latestGovernedRecoveryEvent} from '../intelligence/GovernedPropertyIntelligenceRecoveryInspection.js';
import {RECOVERY_FILTERS,filterGovernedRecoveryAudit,summarizeGovernedRecoveryFilter} from '../intelligence/GovernedPropertyIntelligenceRecoveryFilters.js';
import { readGovernedRecoveryAuditFocus, writeGovernedRecoveryAuditFocus, buildGovernedRecoveryAuditFocusContinuity } from "../intelligence/GovernedPropertyIntelligenceRecoveryFocusPersistence.js";
import {reconcileGovernedRecoveryAuditFocusReset} from "../intelligence/GovernedPropertyIntelligenceRecoveryFocusReset.js";
import {buildProductionEvidenceRuntimeConsistency} from "../intelligence/ProductionEvidenceRuntimeConsistency.js";
import {buildProductionEvidenceRuntimeStatusPresentation} from "../intelligence/ProductionEvidenceRuntimeStatusPresentation.js";
import {buildProductionEvidenceRuntimeDisclosure} from "../intelligence/ProductionEvidenceRuntimeDisclosure.js";
import {buildProductionEvidenceRuntimeInspection} from "../intelligence/ProductionEvidenceRuntimeInspection.js";
import {buildProductionEvidenceSourceInspection} from "../intelligence/ProductionEvidenceSourceInspection.js";
import {buildProductionEvidenceTraceabilityInspection} from "../intelligence/ProductionEvidenceTraceabilityInspection.js";
import {buildProductionEvidenceLineageIntegrity} from "../intelligence/ProductionEvidenceLineageIntegrity.js";
import {buildProductionEvidenceCertificationGate} from "../intelligence/ProductionEvidenceCertificationGate.js";
import {buildProductionEvidenceCertificationAttestation} from "../intelligence/ProductionEvidenceCertificationAttestation.js";
import {buildProductionEvidenceDecisionAuthority} from "../intelligence/ProductionEvidenceDecisionAuthority.js";
import {buildProductionEvidenceDecisionUseContract} from "../intelligence/ProductionEvidenceDecisionUseContract.js";
import {buildGovernedDecisionContext} from "../intelligence/GovernedDecisionContext.js";
import {buildGovernedConsumerContextRuntime} from "../intelligence/GovernedConsumerContextRuntime.js";
import {buildGovernedConsumerInvocationProvenance} from "../intelligence/GovernedConsumerInvocationProvenance.js";
import {buildGovernedConsumerInvocationAuditLedger} from "../intelligence/GovernedConsumerInvocationAuditLedger.js";
import {buildGovernedConsumerInvocationResultProvenance} from "../intelligence/GovernedConsumerInvocationResultProvenance.js";
import {buildGovernedConsumerResultEvidenceEnvelope} from "../intelligence/GovernedConsumerResultEvidenceEnvelope.js";
import {buildGovernedConsumerResultCaptureRuntime} from "../intelligence/GovernedConsumerResultCaptureRuntime.js";
import {buildGovernedConsumerResultEvidenceBindingRuntime} from "../intelligence/GovernedConsumerResultEvidenceBindingRuntime.js";
import {buildGovernedConsumerResultEvidenceVerificationRuntime} from "../intelligence/GovernedConsumerResultEvidenceVerificationRuntime.js";
import {buildGovernedConsumerResultEvidencePromotionRuntime} from "../intelligence/GovernedConsumerResultEvidencePromotionRuntime.js";
import {buildGovernedConsumerResultEvidencePromotionAuthorizationRuntime} from "../intelligence/GovernedConsumerResultEvidencePromotionAuthorizationRuntime.js";
import {buildGovernedConsumerResultEvidencePromotionExecutionRuntime} from "../intelligence/GovernedConsumerResultEvidencePromotionExecutionRuntime.js";
import {buildGovernedConsumerResultEvidencePromotionCommitRuntime} from "../intelligence/GovernedConsumerResultEvidencePromotionCommitRuntime.js";
import {buildGovernedCanonicalCommitExecutionRuntime} from "../intelligence/GovernedCanonicalCommitExecutionRuntime.js";
import { useEffect as bh4g1UseEffect, useState as bh4g1UseState } from 'react';
import {buildCertifiedBoundedAvailabilityV2RuntimeSnapshot} from "../../../explorer4/runtime/MarketAvailabilityRuntimeShadowSidecar.mjs";
import {buildBoundedAvailabilityUiDisclosureViewModel} from "../../../explorer4/runtime/AirBoundedAvailabilityUiDisclosureViewModelV1.mjs";
function normalizeGlobalPropertySearch(value=''){
  return String(value||'').toLowerCase()
    .replace(/\\b(avenue)\\b/g,'ave').replace(/\\b(street)\\b/g,'st')
    .replace(/\\b(road)\\b/g,'rd').replace(/\\b(boulevard)\\b/g,'blvd')
    .replace(/\\b(drive)\\b/g,'dr').replace(/\\b(highway)\\b/g,'hwy')
    .replace(/[.,#]/g,' ').replace(/\\s+/g,' ').trim();
}
function globalPropertySearchScore(property,query){
  const q=normalizeGlobalPropertySearch(query);if(!q)return 0;
  const address=normalizeGlobalPropertySearch(property?.address);
  const city=normalizeGlobalPropertySearch(property?.city);
  const state=normalizeGlobalPropertySearch(property?.state||property?.regionCode);
  const zip=normalizeGlobalPropertySearch(property?.zip||property?.postalCode);
  const owner=normalizeGlobalPropertySearch(property?.owner);
  const haystack=[address,city,state,zip,owner].filter(Boolean).join(' ');
  let score=0;
  if(address===q)score+=1000;
  if(q.startsWith(address)&&address)score+=800;
  if(address.startsWith(q)&&q.length>=6)score+=650;
  if(haystack===q)score+=600;
  if(haystack.includes(q))score+=500;
  for(const token of q.split(' ').filter(Boolean)){
    if(address.includes(token))score+=45;else if(haystack.includes(token))score+=15;
  }
  if(city&&q.includes(city))score+=80;if(zip&&q.includes(zip))score+=80;
  return score;
}
function resolveGlobalPropertySearch(properties,query){
  const normalize=value=>String(value??'').trim().toLowerCase().replace(/\s+/g,' ');
  const q=normalize(query);
  if(!q)return{status:'NO_MATCH',query:String(query??''),property:null,candidates:[]};
  const stableId=p=>String(p?.id??p?.propertyId??p?.canonicalId??p?.buildingId??p?.Building_ID??'');
  const fieldValues=p=>({
    address:normalize(p?.address),
    propertyIds:[p?.id,p?.propertyId,p?.canonicalId,p?.buildingId,p?.Building_ID].map(normalize).filter(Boolean),
    tenants:[p?.tenant,p?.tenantName,p?.company,p?.companyName,p?.occupant,p?.occupier].map(normalize).filter(Boolean),
    owners:[p?.owner,p?.ownerName,p?.ownership].map(normalize).filter(Boolean)
  });
  const ranked=(Array.isArray(properties)?properties:[]).map((property,index)=>{
    const f=fieldValues(property); let score=0;
    if(f.address===q)score=Math.max(score,1000);
    if(f.propertyIds.includes(q))score=Math.max(score,980);
    if(f.tenants.includes(q))score=Math.max(score,960);
    if(f.owners.includes(q))score=Math.max(score,940);
    if(f.address.startsWith(q))score=Math.max(score,800);
    if(f.address.includes(q))score=Math.max(score,700);
    const queryAddressTokens=q.split(' ').filter(Boolean);
    const propertyAddressTokens=f.address.split(' ').filter(Boolean);
    let addressTokenCursor=0;
    const orderedAddressTokenMatch=queryAddressTokens.length>=2&&queryAddressTokens.every(token=>{
      const nextIndex=propertyAddressTokens.indexOf(token,addressTokenCursor);
      if(nextIndex<0)return false;
      addressTokenCursor=nextIndex+1;
      return true;
    });
    if(orderedAddressTokenMatch)score=Math.max(score,690);
    if(f.propertyIds.some(v=>v.startsWith(q)))score=Math.max(score,680);
    if(f.propertyIds.some(v=>v.includes(q)))score=Math.max(score,660);
    if(f.tenants.some(v=>v.startsWith(q)))score=Math.max(score,640);
    if(f.tenants.some(v=>v.includes(q)))score=Math.max(score,620);
    if(f.owners.some(v=>v.startsWith(q)))score=Math.max(score,600);
    if(f.owners.some(v=>v.includes(q)))score=Math.max(score,580);
    return{property,score,index,stableId:stableId(property)};
  }).filter(row=>row.score>0).sort((a,b)=>b.score-a.score||a.stableId.localeCompare(b.stableId)||a.index-b.index);
  if(!ranked.length)return{status:'NO_MATCH',query:String(query??''),property:null,candidates:[]};
  const top=ranked[0],second=ranked[1];
  const exactUnique=top.score>=940&&(!second||second.score<top.score);
  const uniquelyDominant=top.score>=700&&(!second||top.score-second.score>=100);
  if(exactUnique||uniquelyDominant)return{status:'MATCH',query:String(query??''),property:top.property,candidates:ranked.slice(0,8)};
  return{status:'AMBIGUOUS',query:String(query??''),property:null,candidates:ranked.slice(0,8)};
}



/* SCIIP_R35_R2_R2_R10_R4_R1_BOUNDED_AVAILABILITY_UI_BINDING BEGIN */
const SCIIP_BOUNDED_AVAILABILITY_UI_PUBLICATION_ENABLED=true;
const SCIIP_BOUNDED_AVAILABILITY_RUNTIME_SNAPSHOT=buildCertifiedBoundedAvailabilityV2RuntimeSnapshot(Object.freeze({
  asOfDate:"2026-09-01",
  existingCompetitiveStockSf:1316634068,
  leaseAvailableSfLowerBound:24646621,
  leaseAvailableSfUpperBound:30687076,
  correctedLeaseContributorCount:400,
  deterministicallyStatusAlignedCount:337,
  unresolvedMembershipCount:63,
  snapshotFingerprint:"e336e1e5f185db1f7ce3348a3d4ce747e87cab87cf7e30c18a5f7ebaca734cf5"
}));
const SCIIP_BOUNDED_AVAILABILITY_UI_MODEL=buildBoundedAvailabilityUiDisclosureViewModel(SCIIP_BOUNDED_AVAILABILITY_RUNTIME_SNAPSHOT);
const SCIIP_ASKING_MARKET_METRIC_UI_PUBLICATION_ENABLED=true;
const SCIIP_ASKING_MARKET_METRIC_UI_MODEL =
  buildAskingMarketMetricUiDisclosureViewModelV1(getCertifiedAskingMarketMetricDisclosureBinding());

function SciipAskingMarketMetricDisclosure({model}) {
  if (!model) return null;
  return <div className="explorer3__asking-market-metric-disclosure">
    <div><strong>{model.lease.label}</strong></div>
    <div>Lease-rate basis samples - NNN: {model.lease.numericCountsByBasis.NNN}; Gross: {model.lease.numericCountsByBasis.GROSS}; FSG: {model.lease.numericCountsByBasis.FSG}; Unspecified: {model.lease.numericCountsByBasis.UNSPECIFIED}</div>
    <div>Numeric current lease-rate observations: {model.lease.numericCurrentCount}; TBD: {model.lease.tbdCount}; stale excluded: {model.lease.staleExcludedCount}</div>
    <div>No cross-basis point estimate is published.</div>
    <div><strong>{model.sale.label}</strong> - SALE scope only</div>
    <div>Numeric sale-price observations: {model.sale.numericCount}; TBD: {model.sale.tbdCount}; NFS: {model.sale.nfsCount}</div>
    <div>As of {model.asOfDate}. {model.sourceCoverage}</div>
  </div>;
}

function SciipBoundedAvailabilityDisclosure({model}){
  const pct=(v)=>(v*100).toFixed(2)+"%";
  const sf=(v)=>Number(v).toLocaleString("en-US")+" SF";
  return (
    <section data-sciip-bounded-availability-v2="true" aria-label="Bounded market availability disclosure"
      style={{margin:"8px 12px",padding:"10px 12px",border:"1px solid rgba(148,163,184,.28)",borderRadius:8,background:"rgba(15,23,42,.86)",color:"#e5e7eb",fontSize:12,lineHeight:1.35}}>
      <div style={{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap"}}>
        <strong style={{fontSize:13}}>Availability</strong>
        <span style={{fontSize:17,fontWeight:700}}>{pct(model.rateLower)}–{pct(model.rateUpper)}</span>
        <span style={{opacity:.76}}>as of {model.asOfDate}</span>
      </div>
      <div style={{marginTop:4,opacity:.88}}>
        {sf(model.availableSfLower)}–{sf(model.availableSfUpper)} marketed for lease/sublease
        {" · "}{sf(model.denominatorSf)} Existing competitive stock
      </div>
      <div style={{marginTop:4,opacity:.7}}>
        Identity membership: {model.identityMembershipCoverage.deterministicallyStatusAlignedCount}/{model.identityMembershipCoverage.correctedLeaseContributorCount} deterministically aligned;
        {" "}{model.identityMembershipCoverage.unresolvedMembershipCount} unresolved
        {" · "}uncertainty {sf(model.uncertaintySf)}
        {" · "}availability is not vacancy
      </div>
    </section>
  );
}
/* SCIIP_R35_R2_R2_R10_R4_R1_BOUNDED_AVAILABILITY_UI_BINDING MODEL END */

function Explorer3Base(){
  const[state,workspace]=useExplorerWorkspace();
  const{
  properties:EXPLORER3_SOURCE_PROPERTIES,
  relationships:EXPLORER3_RELATIONSHIPS,
  dataStatus
}=useGovernedExplorerData();

/* M419D4BH4G1_R1_GOVERNED_RUNTIME_BINDING
   Controlled runtime parity binding.
   Governed public inventory is preferred; the existing hook remains fallback.
*/
const[bh4g1GovernedProperties,setBh4g1GovernedProperties]=bh4g1UseState(null);
bh4g1UseEffect(()=>{
  let active=true;
  fetch('/explorer/governed-base-inventory.json',{cache:'no-store'})
    .then(response=>{
      if(!response.ok)throw new Error(`governed inventory HTTP ${response.status}`);
      return response.json();
    })
    .then(payload=>{
      if(!active)return;
      const rows=Array.isArray(payload)
        ? payload
        : (payload?.properties||payload?.records||payload?.items||[]);
      setBh4g1GovernedProperties(Array.isArray(rows)?rows:null);
    })
    .catch(()=>{if(active)setBh4g1GovernedProperties(null)});
  return()=>{active=false};
},[]);
const EXPLORER3_PROPERTIES=bh4g1GovernedProperties||EXPLORER3_SOURCE_PROPERTIES;
const SEARCH_PROPERTIES=(Array.isArray(bh4g1GovernedProperties)&&bh4g1GovernedProperties.length)?bh4g1GovernedProperties:EXPLORER3_SOURCE_PROPERTIES;
  const[paletteOpen,setPaletteOpen]=useState(false);
  const[focusPropertyId,setFocusPropertyId]=useState(null);
  const[focusRequestKey,setFocusRequestKey]=useState(0);
  const[propertySearch,setPropertySearch]=useState('');
  const[globalSearchFeedback,setGlobalSearchFeedback]=useState(null);
  const[globalSearchCandidateIndex,setGlobalSearchCandidateIndex]=useState(0);
  const[searchExpanded,setSearchExpanded]=useState(true);
  const[layersOpen,setLayersOpen]=useState(false);
  const[mapType,setMapType]=useState('hybrid');
  const[mapVisibility,setMapVisibility]=useState(DEFAULT_VISIBILITY);
  const[activeMarketMetricId,setActiveMarketMetricId]=useState(null);
  const[marketRadius,setMarketRadius]=useState(10);
  const[marketFilters,setMarketFilters]=useState(DEFAULT_MARKET_FILTERS);
  const searchInputRef=useRef(null);
  const sourceSelectedProperty=EXPLORER3_PROPERTIES.find(p=>p.id===state.selectedPropertyId)||EXPLORER3_PROPERTIES[0];
  const governedSelectedMapRuntime=resolveGovernedSelectedPropertyMapRuntime(sourceSelectedProperty,{property:sourceSelectedProperty});
  const property=governedSelectedMapRuntime.mapProperty||sourceSelectedProperty;
  const mapSelectedProperty=property;
  // M2.34: Market Context/radius calculations use the governed selected
  // property as their anchor. Inventory datasets and aggregate logic are unchanged.
  const governedMarketContextAnchor=resolveGovernedMarketContextAnchor(
    sourceSelectedProperty,
    {property:sourceSelectedProperty}
  );
  const marketContextProperty=governedMarketContextAnchor.anchorProperty||property;
  // M2.35: live Market Context ribbon consumer binding.
  const governedMarketContextConsumer=resolveGovernedMarketContextConsumer(
    sourceSelectedProperty,
    {property:sourceSelectedProperty}
  );
  const marketContextConsumerProperty=
    governedMarketContextConsumer.property||marketContextProperty;
const governedNeighborContext=useMemo(()=>buildGovernedNeighborContext(marketContextConsumerProperty,EXPLORER3_PROPERTIES,{maxFeet:5280,adjacencyToleranceFeet:45,limit:24}),[property,EXPLORER3_PROPERTIES]);

  
// M2.36: preserve source neighbor result before governed derivation.
const sourceNeighbors=useMemo(
  ()=>buildImmediateNeighbors({
    subject:property,
    properties:EXPLORER3_PROPERTIES,
    parcelRelationships:EXPLORER3_RELATIONSHIPS,
    maxDistanceMiles:2
  }),
  [property,EXPLORER3_PROPERTIES,EXPLORER3_RELATIONSHIPS]
);

// Governed collection derives only after source initialization.
const governedNeighborCollection=useMemo(
  ()=>resolveGovernedNeighborRadiusCollection(sourceNeighbors.rows||sourceNeighbors.properties||sourceNeighbors),
  [sourceNeighbors]
);

// Preserve the legacy neighbor result shape for downstream consumers.
const neighbors=useMemo(
  ()=>({
    ...sourceNeighbors,
    relationships:governedNeighborContext.neighbors.map(row=>({
      neighborPropertyId:row.propertyId,
      relationshipType:row.relationshipType,
      distanceFeet:row.distanceFeet
    })),
    rows:governedNeighborCollection.properties
  }),
  [sourceNeighbors,governedNeighborCollection,governedNeighborContext]
);

const neighborIntelligence=useMemo(
  ()=>buildNeighborIntelligence({subject:property,neighbors}),
  [property,neighbors]
);
const spatialIdentity=useMemo(()=>propertySpatialIdentity(property),[property]);
  const{parcelState:lightBoxParcel,model:liveGovernedIntelligence}=useLiveGovernedPropertyIntelligence(property);
  const lightBoxProxyHealth=useLightBoxProxyHealth();
  const liveExternalParcelOverlay=useMemo(()=>buildLiveExternalParcelOverlay(property,lightBoxParcel),[property,lightBoxParcel]);
  const lightBoxReadiness=useLightBoxReadiness();
  const plugins=useMemo(()=>getExplorerPlugins(),[]);
  // M2.37: Market Context candidate/cohort properties resolve through
  // governed runtime. Source inventory and formulas remain immutable.
  const governedMarketContextCohort=useMemo(
    ()=>resolveGovernedMarketContextCohort(EXPLORER3_PROPERTIES),
    [EXPLORER3_PROPERTIES]
  );
  const marketContextProperties=governedMarketContextCohort.properties;

  const marketContext=useMemo(()=>buildMarketContext({subject:marketContextConsumerProperty,properties:marketContextProperties,radiusMiles:marketRadius,filters:marketFilters,visibility:mapVisibility}),[marketContextConsumerProperty,marketContextProperties,marketRadius,marketFilters,mapVisibility]);
  

  // M2.38: one governed presentation contract for visible Market Context metrics.

  const governedMarketMetricPresentation=useMemo(

    ()=>buildGovernedMarketContextMetricPresentation(marketContext),

    [marketContext]

  );

  const marketMetricPresentation=governedMarketMetricPresentation.metrics;
  // M2.40: the visible ribbon now consumes the governed presentation contract
  // through an explicit, legacy-compatible ribbon context.
  const marketContextRibbonContext=useMemo(
    ()=>buildGovernedMarketContextRibbonContract(
      marketContext,
      governedMarketMetricPresentation
    ),
    [marketContext,governedMarketMetricPresentation]
  );
const activeMarketMetric=marketContext.metrics.find(item=>item.id===activeMarketMetricId)||null;
// M2.41: governed Market Metric detail consumer binding.
const governedMarketMetricDetailContext=useMemo(
  ()=>buildGovernedMarketMetricDetailContract(activeMarketMetric,marketContextRibbonContext),
  [activeMarketMetric,marketContextRibbonContext]
);

  // M2.42: governed Market spatial-highlight consumer binding.
  // IMPORTANT: this must initialize AFTER governedMarketMetricDetailContext.
  const governedMarketSpatialHighlightContext=useMemo(
    ()=>buildGovernedMarketSpatialHighlightContract(
      governedMarketMetricDetailContext,
      marketContext,
      state.drawerSection
    ),
    [governedMarketMetricDetailContext,marketContext,state.drawerSection]
  );
  const highlightedPropertyIds=governedMarketSpatialHighlightContext.highlightedPropertyIds;
  const spatialContext=governedMarketSpatialHighlightContext;
  // M2.44: Property Intelligence consumes the same governed selection identity
  // used by map / focus / neighbor interactions.
  const governedPropertyIntelligenceSelection=useMemo(
    ()=>resolveGovernedPropertyIntelligenceSelection({
      spatialSelection:resolveGovernedMarketSpatialSelection(
        property,
        governedMarketMetricDetailContext,
        governedMarketSpatialHighlightContext,
        'PROPERTY_INTELLIGENCE'
      ),
      selectedProperty:property,
      properties:EXPLORER3_PROPERTIES
    }),
    [
      property,
      governedMarketMetricDetailContext,
      governedMarketSpatialHighlightContext,
      EXPLORER3_PROPERTIES
    ]
  );
  const propertyIntelligenceProperty=
    governedPropertyIntelligenceSelection.property||property;
  // M2.45: one governed presentation contract for Property Intelligence header + body.
  const governedPropertyIntelligencePresentation=useMemo(
    ()=>buildGovernedPropertyIntelligencePresentation(
      governedPropertyIntelligenceSelection,
      propertyIntelligenceProperty
    ),
    [governedPropertyIntelligenceSelection,propertyIntelligenceProperty]
  );

  // M2.46: derived Property Intelligence runtime resolves from M2.45 presentation.
  const governedPropertyIntelligenceDerivedRuntime=useMemo(
    ()=>resolveGovernedPropertyIntelligenceDerivedRuntime(
      governedPropertyIntelligencePresentation,
      propertyIntelligenceProperty
    ),
    [governedPropertyIntelligencePresentation,propertyIntelligenceProperty]
  );
  const propertyIntelligenceRuntimeProperty=
    governedPropertyIntelligenceDerivedRuntime.property||propertyIntelligenceProperty;
  const propertyIntelligenceSpatialIdentity=useMemo(
    ()=>propertySpatialIdentity(propertyIntelligenceRuntimeProperty),
    [propertyIntelligenceRuntimeProperty]
  );
  const{
    parcelState:propertyIntelligenceLightBoxParcel,
    model:propertyIntelligenceLiveGovernedIntelligence
  }=useLiveGovernedPropertyIntelligence(propertyIntelligenceRuntimeProperty);




  const visibleProperties=useMemo(()=>EXPLORER3_PROPERTIES.filter(item=>{
    if(item.id===property.id)return true;
    return isPropertyVisibleForMarket(item,mapVisibility)&&passesMarketFilters(item,marketFilters);
  }),[mapVisibility,marketFilters,property.id]);

  useEffect(()=>{
    if(state.drawerOpen!==undefined)setFocusRequestKey(value=>value+1);
  },[state.drawerOpen]);

  useEffect(()=>{
    const onKey=e=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPaletteOpen(true);}
      if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();setSearchExpanded(true);requestAnimationFrame(()=>searchInputRef.current?.focus());}
      if(e.key==='Escape'&&activeMarketMetricId)setActiveMarketMetricId(null);
      else if(e.key==='Escape'&&state.drawerOpen)workspace.closeDrawer();
      else if(e.key==='Escape'&&searchExpanded){setSearchExpanded(false);setPropertySearch('');}
    };
    document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey);
  },[activeMarketMetricId,state.drawerOpen,workspace,searchExpanded]);

  const runCommand=action=>{
    if(action==='present')workspace.setMode('present');
    else if(action==='analyze')workspace.setMode('analyze');
    else if(action==='neighbors')workspace.openDrawer('neighbors');
    else if(action==='market')workspace.openDrawer('market');
    else if(action==='property'||action==='explain')workspace.openDrawer('property');
    else if(action==='compare')workspace.toggleCompare(property.id);
  };

  const searchResults=propertySearch.trim()?SEARCH_PROPERTIES.filter(p=>`${p.address} ${p.city} ${p.owner} ${p.status}`.toLowerCase().includes(propertySearch.toLowerCase())):[];
  const neighborRelationships=state.drawerSection==='neighbors'?neighbors.relationships:[];
  const spotlightRadius=state.drawerSection==='neighbors'?1:marketRadius;

  const selectProperty=id=>{workspace.selectProperty(id);setPropertySearch('');setFocusPropertyId(null);setActiveMarketMetricId(null);};

  useEffect(()=>{
    const execute=query=>{
      const value=String(query||'').trim();if(!value)return;
      setPropertySearch(value);
      const resolution=resolveGlobalPropertySearch(SEARCH_PROPERTIES,value);
      if(resolution.status==='MATCH'&&resolution.property){
        setGlobalSearchFeedback({status:'MATCH',query:value,property:resolution.property});
        selectProperty(resolution.property.id);
        setFocusPropertyId(resolution.property.id);
        setFocusRequestKey(key=>key+1);
        sessionStorage.removeItem('sciip.globalSearchQuery');
        return;
      }
      setGlobalSearchFeedback({status:resolution.status,query:value,candidates:resolution.candidates.map(row=>row.property)});
      setGlobalSearchCandidateIndex(0);
    };
    const handler=event=>execute(event?.detail?.query);
    window.addEventListener('sciip:global-property-search',handler);
    const pending=sessionStorage.getItem('sciip.globalSearchQuery');
    if(pending)globalThis.requestAnimationFrame(()=>execute(pending));
    return()=>window.removeEventListener('sciip:global-property-search',handler);
  },[EXPLORER3_PROPERTIES]);

  const toggleVisibility=id=>setMapVisibility(current=>({...current,[id]:!current[id]}));

  return <section className={`explorer3 explorer3--${state.mode} ${state.drawerOpen?'explorer3--drawer-open':''}`}>
    {dataStatus?.state==='DEGRADED'&&<div className="explorer3__runtime-guard"><strong>Explorer data temporarily unavailable</strong><span>{dataStatus?.error||'Governed data could not be loaded.'}</span></div>}
    {globalSearchFeedback?.status==='NO_MATCH'&&state.mode!=='present'&&<div className="explorer3__global-search-feedback explorer3__global-search-feedback--warning"><strong>Property not found in governed Explorer inventory</strong><span>{globalSearchFeedback.query}</span></div>}
    {globalSearchFeedback?.status==='AMBIGUOUS'&&state.mode!=='present'&&<div className="explorer3__global-search-feedback" role="listbox" aria-label="Global property search candidates" tabIndex={0} onKeyDown={event=>{
          const candidates=globalSearchFeedback.candidates||[];
          if(!candidates.length)return;
          if(event.key==='ArrowDown'){event.preventDefault();setGlobalSearchCandidateIndex(index=>(index+1)%candidates.length);}
          else if(event.key==='ArrowUp'){event.preventDefault();setGlobalSearchCandidateIndex(index=>(index-1+candidates.length)%candidates.length);}
          else if(event.key==='Enter'){
            event.preventDefault();
            const candidate=candidates[Math.min(globalSearchCandidateIndex,candidates.length-1)];
            if(candidate){const stableId=candidate.id||candidate.propertyId||candidate.canonicalId||candidate.buildingId||candidate.Building_ID;if(stableId){selectProperty(stableId);setGlobalSearchFeedback(null);}}
          }
        }}><strong>Multiple governed properties match</strong><span>Select a property from the Explorer search results.</span><div className="explorer3__global-search-candidates">{(globalSearchFeedback.candidates||[]).slice(0,8).map((candidate,index)=>{const stableId=candidate.id||candidate.propertyId||candidate.canonicalId||candidate.buildingId||candidate.Building_ID||`candidate-${index}`;return <button key={stableId} type="button" role="option" aria-selected={index===globalSearchCandidateIndex} data-property-id={stableId} className={`explorer3__global-search-candidate${index===globalSearchCandidateIndex?' is-active':''}`} onMouseEnter={()=>setGlobalSearchCandidateIndex(index)} onClick={()=>{if(stableId){selectProperty(stableId);setGlobalSearchFeedback(null);}}}><strong>{candidate.address||stableId}</strong><span>{candidate.city||''}</span><small>{stableId}</small></button>})}</div></div>}
    <ExplorerMap properties={visibleProperties} selectedPropertyId={property.id} onSelectProperty={value=>selectProperty(resolveGovernedMarketSpatialSelection(value,governedMarketMetricDetailContext,governedMarketSpatialHighlightContext,'MAP').propertyId)} spotlightRadiusMiles={spotlightRadius} neighborRelationships={neighborRelationships} focusPropertyId={focusPropertyId} focusRequestKey={focusRequestKey} mapType={mapType} spatialContext={spatialContext} externalParcelOverlay={liveExternalParcelOverlay}/>

    {state.mode!=='present'&&<MarketContextRibbon context={marketContextRibbonContext} radius={marketRadius} onRadius={value=>{setMarketRadius(value);setActiveMarketMetricId(null);}} activeId={activeMarketMetricId} onSelect={id=>setActiveMarketMetricId(current=>current===id?null:id)}/>}

    <header className="explorer3__topbar">
      <div className="explorer3__brand"><span>SCIIP</span><strong>Explorer</strong><b>3.0</b></div>
      <div className="explorer3__mode-switch" aria-label="Explorer operating mode">{Object.entries(MODE_LABELS).map(([id,label])=><button key={id} className={state.mode===id?'active':''} onClick={()=>{workspace.setMode(id);if(id==='command')setPaletteOpen(true);}}>{id==='present'&&<Presentation size={14}/>} {label}</button>)}</div>
    </header>

    {activeMarketMetric&&state.mode!=='present'&&<MarketMetricDetailPanel context={governedMarketMetricDetailContext} onClose={()=>setActiveMarketMetricId(null)} onShowProperty={selectProperty}/>} 


    {state.mode!=='present'&&<BottomSearch
      expanded={searchExpanded}
      setExpanded={setSearchExpanded}
      value={propertySearch}
      setValue={setPropertySearch}
      results={searchResults}
      inputRef={searchInputRef}
      onSelect={row=>selectProperty(row.id)}
      onCommand={()=>setPaletteOpen(true)}
    />}

    {state.mode!=='present'&&<MapLegendLayers open={layersOpen} onToggle={()=>setLayersOpen(value=>!value)} mapType={mapType} onMapType={setMapType} value={mapVisibility} onToggleVisibility={toggleVisibility} filters={marketFilters} onFilters={setMarketFilters}/>}


    {state.mode!=='present'&&<MapRail onNeighbors={()=>workspace.openDrawer('neighbors')} onMarket={()=>workspace.openDrawer('market')} onProperty={()=>workspace.openDrawer('property')}/>} 

    {state.drawerOpen&&<ContextDrawer section={state.drawerSection} property={property} propertyIntelligenceProperty={propertyIntelligenceProperty} propertyIntelligencePresentation={governedPropertyIntelligencePresentation} neighbors={neighbors} neighborIntelligence={neighborIntelligence} spatialIdentity={propertyIntelligenceSpatialIdentity} lightBoxParcel={propertyIntelligenceLightBoxParcel} liveGovernedIntelligence={propertyIntelligenceLiveGovernedIntelligence} lightBoxProxyHealth={lightBoxProxyHealth} lightBoxReadiness={lightBoxReadiness} plugins={plugins} onClose={workspace.closeDrawer} onSection={workspace.setDrawerSection} onFocus={value=>setFocusPropertyId(resolveGovernedMarketSpatialSelection(value,governedMarketMetricDetailContext,governedMarketSpatialHighlightContext,'FOCUS').propertyId)} onOpenNeighbor={value=>selectProperty(resolveGovernedMarketSpatialSelection(value,governedMarketMetricDetailContext,governedMarketSpatialHighlightContext,'NEIGHBOR').propertyId)}/>} 

    {state.compareIds.length>0&&state.mode!=='present'&&<CompareDock ids={state.compareIds} onRemove={workspace.toggleCompare} properties={EXPLORER3_PROPERTIES}/>} 

    <ExplorerCommandPalette open={paletteOpen} onClose={()=>{setPaletteOpen(false);if(state.mode==='command')workspace.setMode('analyze');}} onRun={runCommand} property={property}/>
  </section>;
}

function MapLegendLayers({open,onToggle,mapType,onMapType,value,onToggleVisibility,filters,onFilters}){
  const items=[['selected','Selected Property'],['nearby','Base Inventory'],['available','Available'],['comparable','Comparable'],['supersheet','SuperSheet']];
  const updateFilter=(field,raw)=>onFilters(current=>({...current,[field]:Math.max(0,Number(raw)||0)}));
  const resetFilters=()=>onFilters(DEFAULT_MARKET_FILTERS);
  const filtered=Boolean(filters.minSf||filters.maxSf||filters.minClearHeight);
  const activeCount=Object.values(value).filter(Boolean).length;
  return <section className={`explorer3__legend-layers ${open?'open':''}`} aria-label="Map legend and layers">
    {open&&<div className="explorer3__legend-layers-panel">
      <header><div><strong>Map Legend & Layers</strong><span>{activeCount} data layers active</span></div><button onClick={onToggle} title="Collapse map legend and layers"><X size={14}/></button></header>
      <div className="explorer3__layer-group"><strong>Basemap</strong><div className="explorer3__basemap-options">{[['hybrid','Hybrid'],['satellite','Satellite'],['roadmap','Road']].map(([id,label])=><label key={id}><input type="radio" name="explorer3-basemap" checked={mapType===id} onChange={()=>onMapType(id)}/><span>{label}</span></label>)}</div></div>
      <div className="explorer3__layer-group"><strong>Map Data</strong>{Object.entries(VISIBILITY_LABELS).map(([id,label])=><label key={id} className={`explorer3__layer-check ${value[id]?'checked':''}`}><input type="checkbox" checked={Boolean(value[id])} onChange={()=>onToggleVisibility(id)}/><span className="explorer3__check"><Check size={11}/></span><span>{label}</span></label>)}</div>
      <div className="explorer3__layer-group"><div className="explorer3__cohort-filter-head"><strong>Cohort Filters</strong>{filtered&&<button onClick={resetFilters}>Reset</button>}</div><div className="explorer3__cohort-fields"><label><span>Min SF</span><input type="number" step="50000" min="0" value={filters.minSf||''} placeholder="Any" onChange={e=>updateFilter('minSf',e.target.value)}/></label><label><span>Max SF</span><input type="number" step="50000" min="0" value={filters.maxSf||''} placeholder="Any" onChange={e=>updateFilter('maxSf',e.target.value)}/></label><label><span>Clear ≥</span><input type="number" step="2" min="0" value={filters.minClearHeight||''} placeholder="Any" onChange={e=>updateFilter('minClearHeight',e.target.value)}/></label></div></div>
      <div className="explorer3__layer-group explorer3__legend-key"><strong>Legend</strong><div>{items.map(([tone,label])=><span key={tone}><i className={tone}/>{label}</span>)}</div></div>
    </div>}
    <button className="explorer3__legend-layers-toggle" onClick={onToggle} aria-expanded={open}><Layers3 size={17}/><strong>Map Legend & Layers</strong>{filtered&&<i className="explorer3__filter-dot"/>}{open?<ChevronDown size={15}/>:<ChevronUp size={15}/>}</button>
  </section>;
}

function BottomSearch({expanded,setExpanded,value,setValue,results,inputRef,onSelect,onCommand}){
  if(!expanded)return <button className="explorer3__search-collapsed" onClick={()=>{setExpanded(true);requestAnimationFrame(()=>inputRef.current?.focus());}}><Search size={17}/><span>Search</span><kbd>/</kbd></button>;
  return <section className="explorer3__search-dock" aria-label="Property search">
    <Search size={17}/>
    <input ref={inputRef} value={value} onChange={e=>setValue(e.target.value)} placeholder="Search property, owner, market, address…"/>
    <button className="explorer3__search-command" onClick={onCommand} title="Open AI command palette"><kbd>⌘ K</kbd></button>
    <button className="explorer3__search-collapse" onClick={()=>{setExpanded(false);setValue('');}} title="Collapse search"><ChevronDown size={17}/></button>
    {results.length>0&&<div className="explorer3__search-results explorer3__search-results--dock">{results.map(row=><button key={row.id} onClick={()=>onSelect(row)}><MapPin size={14}/><span><strong>{row.address}</strong><small>{row.city} · {row.owner} · {row.status}</small></span></button>)}</div>}
  </section>;
}

function MarketContextRibbon({context,radius,onRadius,activeId,onSelect}){return <section className="explorer3__ribbon explorer3__market-ribbon">
  <div className="explorer3__market-ribbon-label"><strong>Market Context</strong><span>{context.summary}</span></div>
  <div className="explorer3__radius-control" aria-label="Market radius">{MARKET_RADII.map(value=><button key={value} className={radius===value?'active':''} onClick={()=>onRadius(value)}>{value} mi</button>)}</div>
  <div className="explorer3__market-metrics">{context.metrics.map(item=><button key={item.id} className={activeId===item.id?'active':''} onClick={()=>onSelect(item.id)} aria-expanded={activeId===item.id}><b>{item.value}</b><span>{item.label}</span></button>)}</div>
  {context.filtered&&<span className="explorer3__cohort-filtered">Filtered</span>}
</section>;}

function MarketMetricDetailPanel({context,onClose,onShowProperty}){const metric=context.metric;if(!metric)return null;return <aside className="explorer3__ribbon-detail explorer3__market-detail"><header><div><span>Market Context · {context.radiusMiles} mi</span><strong>{metric.value} {metric.label}</strong><small>{metric.subtitle}</small></div><button onClick={onClose}><X size={15}/></button></header><div>{metric.rows.length?metric.rows.map((detail,index)=><article key={`${metric.id}-${index}`}><div><strong>{detail.title}</strong><span>{detail.meta}</span></div>{detail.propertyId&&<button onClick={()=>onShowProperty(detail.propertyId)}>Show on map <ArrowRight size={12}/></button>}</article>):<p className="explorer3__empty-context">No records in the current radius and filter cohort.</p>}</div></aside>;}


function MapRail({onNeighbors,onMarket,onProperty}){return <nav className="explorer3__map-rail"><button onClick={onProperty} title="Property intelligence"><Building2 size={17}/></button><button onClick={onNeighbors} title="Neighbor intelligence"><Users size={17}/></button><button onClick={onMarket} title="Market spotlight"><Layers3 size={17}/></button><button title="Presentation mode"><Maximize2 size={17}/></button></nav>;}

// M2.54: broker-facing execution feedback; presentation only.
function GovernedActionExecutionFeedback({feedback,recovery,onReview,onRetry}){
 if(!feedback?.visible)return null;
 return <div className={`explorer3__governed-action-feedback explorer3__governed-action-feedback--${String(feedback.state||'idle').toLowerCase()}`} role={feedback.state==='FAILED'?'alert':'status'} aria-live="polite">
      {SCIIP_BOUNDED_AVAILABILITY_UI_PUBLICATION_ENABLED ? <SciipBoundedAvailabilityDisclosure model={SCIIP_BOUNDED_AVAILABILITY_UI_MODEL}/> : null}
      {/* SCIIP_R35_R2_R2_R10_R4_R1_BOUNDED_AVAILABILITY_UI_BINDING RENDER END */}<div><strong>{governedActionFeedbackLabel(feedback)}</strong><span>{feedback.message}</span></div>{((recovery?.canReview??feedback.canReview)||(recovery?.canRetry??feedback.canRetry))&&<div className="explorer3__governed-action-feedback-actions">{(recovery?.canReview??feedback.canReview)&&<button type="button" onClick={onReview}>Review</button>}{(recovery?.canRetry??feedback.canRetry)&&<button type="button" onClick={onRetry}>Retry</button>}</div>}</div>;
}


function GovernedRecoveryAuditDiagnostics({audit,diagnostics,propertyId}){
  const sourceEvents=Array.isArray(audit)?audit:(Array.isArray(audit?.events)?audit.events:[]);
  const latest=latestGovernedRecoveryEvent(sourceEvents);
  const[selectedRecoveryEventId,setSelectedRecoveryEventId]=useState(()=>latest?.eventId||latest?.id||null);
  const[recoveryAuditFilter,setRecoveryAuditFilter]=useState(()=>readGovernedRecoveryAuditFocus(propertyId));
  // M2.61: operator focus continuity is session-scoped UI state only.
  const governedRecoveryAuditFocusContinuity=useMemo(
    ()=>buildGovernedRecoveryAuditFocusContinuity(propertyId,recoveryAuditFilter),
    [propertyId,recoveryAuditFilter]
  );
  useEffect(()=>{
    writeGovernedRecoveryAuditFocus(propertyId,recoveryAuditFilter);
  },[propertyId,recoveryAuditFilter]);


  const filteredEvents=useMemo(
    ()=>filterGovernedRecoveryAudit(sourceEvents,recoveryAuditFilter),
    [sourceEvents,recoveryAuditFilter]
  );
  const filterSummary=useMemo(
    ()=>summarizeGovernedRecoveryFilter(sourceEvents,recoveryAuditFilter),
    [sourceEvents,recoveryAuditFilter]
  );

  useEffect(()=>{
    if(!filteredEvents.length){setSelectedRecoveryEventId(null);return;}
    const exists=filteredEvents.some(event=>(event?.eventId||event?.id||null)===selectedRecoveryEventId);
    if(!exists){
      const fallback=latestGovernedRecoveryEvent(filteredEvents);
      setSelectedRecoveryEventId(fallback?.eventId||fallback?.id||null);
    }
  },[recoveryAuditFilter,diagnostics?.eventCount]);

  if(!diagnostics||diagnostics.eventCount===0)return null;

  const selectedEvent=
    filteredEvents.find(event=>(event?.eventId||event?.id||null)===selectedRecoveryEventId)||
    latestGovernedRecoveryEvent(filteredEvents)||
    null;
  const inspection=buildGovernedRecoveryEventInspection(selectedEvent);

  const resetGovernedRecoveryAuditFocus=()=>reconcileGovernedRecoveryAuditFocusReset(
    setRecoveryAuditFilter,
    writeGovernedRecoveryAuditFocus,
    propertyId
  );

  return <section className="explorer3__governed-recovery-diagnostics" data-milestone="M2.60">
    <SectionTitle title="Recovery Audit" subtitle="Operator diagnostics"/>

    <div className="explorer3__detail-grid">
      <Detail label="Audit Events" value={diagnostics.eventCount}/>
      <Detail label="Failures" value={diagnostics.failures}/>
      <Detail label="Recoveries" value={diagnostics.recoveries}/>
      <Detail label="State" value={diagnostics.state}/>
    </div>

    <div className="explorer3__recovery-filter-bar" data-m2-60="filters">
      {Object.values(RECOVERY_FILTERS).map(filter=><button
        key={filter}
        type="button"
        className={recoveryAuditFilter===filter?'active':''}
        aria-pressed={recoveryAuditFilter===filter}
        onClick={()=>setRecoveryAuditFilter(filter)}
      >
        {filter==='ALL'?'All':filter[0]+filter.slice(1).toLowerCase()}
      </button>)}
    </div>

    <button
      type="button"
      data-m2-62="reset-focus"
      onClick={resetGovernedRecoveryAuditFocus}
      disabled={recoveryAuditFilter===RECOVERY_FILTERS.ALL}
    >
      Reset Focus
    </button>

    <p className="explorer3__copy">
      Showing {filterSummary.visible} of {filterSummary.total} recovery events. Filtering is read-only and does not alter the append-only governed audit.
    </p>

    <div className="explorer3__recovery-audit-list" data-m2-60="timeline">
      {filteredEvents.slice(-5).reverse().map((event,index)=>{
        const id=event?.eventId||event?.id||`${event?.type||'event'}-${index}`;
        const row=formatGovernedRecoveryAuditEvent(event);
        const active=id===selectedRecoveryEventId;
        return <button
          key={id}
          type="button"
          className={`explorer3__recovery-audit-row${active?' active':''}`}
          onClick={()=>setSelectedRecoveryEventId(id)}
          aria-pressed={active}
        >
          <strong>{row.label}</strong>
          <span>{row.state||'—'}</span>
          {row.at&&<small>{row.at}</small>}
        </button>;
      })}
    </div>

    {inspection.visible&&<div className="explorer3__governed-recovery-inspection" data-m2-60="inspection">
      <SectionTitle title="Event Inspection" subtitle={inspection.label}/>
      <div className="explorer3__detail-grid">
        <Detail label="State" value={inspection.state||'—'}/>
        <Detail label="Action" value={inspection.action||'—'}/>
        <Detail label="Retry #" value={inspection.retryCount}/>
        <Detail label="Authority" value={inspection.authoritative?'Authoritative':'Observed'}/>
      </div>
      {inspection.retryOf&&<p className="explorer3__copy">Retry lineage: {inspection.retryOf}</p>}
      {inspection.message&&<p className="explorer3__copy">{inspection.message}</p>}
    </div>}

    <div className="explorer3__micro-meta">
      <span>Append-only</span>
      <span>Property scoped</span>
      <span>Filtered view only</span>
      <span>Canonical writes: OFF</span>
    </div>
  </section>;
}
function ContextDrawer({section,property,propertyIntelligenceProperty,propertyIntelligencePresentation,neighbors,neighborIntelligence,spatialIdentity,lightBoxParcel,liveGovernedIntelligence,lightBoxProxyHealth,lightBoxReadiness,plugins,onClose,onSection,onFocus,onOpenNeighbor,optimisticExecution,authoritativeActionEvent,onReviewAction,onRetryAction,onExecuteGovernedRetry}){
  const drawerProperty=
    propertyIntelligencePresentation?.property||
    propertyIntelligenceProperty||
    property;

  const rows=Object.values(neighbors.directions).flat();
  const normalizedSection=section==='overview'?'property':section;
  const governedActionFeedback=resolveGovernedPropertyIntelligenceActionFeedback({optimisticExecution,authoritativeEvent:authoritativeActionEvent,propertyId:(propertyIntelligencePresentation?.property||propertyIntelligenceProperty||property)?.id||null});
  const recoveryPropertyId=(propertyIntelligencePresentation?.property||propertyIntelligenceProperty||property)?.id||null;
  const[governedRecoveryAuditRevision,setGovernedRecoveryAuditRevision]=useState(0);
  const governedRecoveryAudit=useMemo(
    ()=>summarizeGovernedRecoveryAudit(recoveryPropertyId),
    [recoveryPropertyId,governedRecoveryAuditRevision]
  );

  // M2.58: read-only operator diagnostics derived from the M2.57 append-only audit.
  const governedRecoveryAuditDiagnostics=useMemo(
    ()=>buildGovernedRecoveryAuditDiagnostics(governedRecoveryAudit?.events||governedRecoveryAudit),
    [governedRecoveryAudit]
  );
  const recordGovernedRecoveryAudit=(event)=>{
    const written=appendGovernedRecoveryAuditEvent({propertyId:recoveryPropertyId,...event});
    if(written)setGovernedRecoveryAuditRevision(v=>v+1);
    return written;
  };
  const[governedActionRecoveryState,setGovernedActionRecoveryState]=useState(()=>readGovernedRecoverySession(recoveryPropertyId));
  useEffect(()=>{if(!recoveryPropertyId)return;setGovernedActionRecoveryState(readGovernedRecoverySession(recoveryPropertyId));},[recoveryPropertyId]);
  useEffect(()=>{if(!recoveryPropertyId)return;if(governedActionRecoveryState)writeGovernedRecoverySession(recoveryPropertyId,governedActionRecoveryState);},[recoveryPropertyId,governedActionRecoveryState]);
  const governedActionRecovery=resolveGovernedActionRecovery({
    feedback:governedActionFeedback,
    previousRecovery:governedActionRecoveryState,
    propertyId:recoveryPropertyId
  });
  useEffect(()=>{
    if(!recoveryPropertyId)return;
    if(governedActionFeedback?.state!=='FAILED'||!governedActionFeedback?.authoritative)return;
    recordGovernedRecoveryAudit({
      type:'ACTION_FAILED',
      state:governedActionRecovery?.state||'RETRY_READY',
      retryCount:governedActionRecovery?.retryCount||0,
      retryOf:governedActionRecovery?.retryOf||null,
      authoritative:true
    });
  },[recoveryPropertyId,governedActionFeedback?.state,governedActionFeedback?.authoritative]);
  const handleGovernedReview=()=>onReviewAction?.(governedActionFeedback);
  const handleGovernedRetry=async()=>{
    if(!governedActionRecovery.canRetry)return null;
    const propertyId=recoveryPropertyId;
    const failedExecution=authoritativeActionEvent||optimisticExecution||null;
    const pending=beginGovernedActionRetry({
      propertyId,
      action:failedExecution?.action||failedExecution?.type||'UNKNOWN',
      fieldKey:failedExecution?.fieldKey||null,
      decision:failedExecution?.decision||null,
      previousRecovery:governedActionRecoveryState,
      failedExecution
    });
    setGovernedActionRecoveryState(pending);
    recordGovernedRecoveryAudit({
      type:'RETRY_STARTED',
      state:pending?.state||'RETRY_PENDING',
      retryCount:pending?.retryCount||0,
      retryOf:pending?.retryOf||null,
      action:pending?.action||null,
      fieldKey:pending?.fieldKey||null,
      decision:pending?.decision||null,
      authoritative:false
    });
    try{
      const result=await onExecuteGovernedRetry?.({retry:pending,failedExecution,property:propertyIntelligencePresentation?.property||propertyIntelligenceProperty||property});
      const reconciled=reconcileGovernedActionRetry(pending,result||{status:'SUCCEEDED'},null);
      setGovernedActionRecoveryState(reconciled);
      if(reconciled?.state==='RECOVERED'){
        recordGovernedRecoveryAudit({
          type:'RECOVERED',
          state:reconciled.state,
          retryCount:reconciled?.retryCount||0,
          retryOf:reconciled?.retryOf||null,
          action:reconciled?.action||null,
          authoritative:true
        });
        clearGovernedRecoverySession(recoveryPropertyId);
        recordGovernedRecoveryAudit({
          type:'RECOVERY_SESSION_CLEARED',
          state:'RECOVERED',
          retryCount:reconciled?.retryCount||0,
          retryOf:reconciled?.retryOf||null,
          authoritative:true
        });
      }
      return reconciled;
    }catch(error){
      const reconciled=reconcileGovernedActionRetry(pending,null,error);
      setGovernedActionRecoveryState(reconciled);
      recordGovernedRecoveryAudit({
        type:'RETRY_FAILED',
        state:reconciled?.state||'RETRY_FAILED',
        retryCount:reconciled?.retryCount||0,
        retryOf:reconciled?.retryOf||null,
        action:reconciled?.action||null,
        authoritative:true,
        metadata:{error:String(error?.message||error)}
      });
      return reconciled;
    }
  };
  const tabs=['property','market','neighbors','activity'];
  return <aside className="explorer3__drawer"><header><div><span>Property Intelligence</span><strong>{propertyIntelligencePresentation?.address||drawerProperty?.address}</strong></div><button onClick={onClose}><X size={17}/></button></header>
    <nav>{tabs.map(id=><button key={id} className={normalizedSection===id?'active':''} onClick={()=>onSection(id)}>{id[0].toUpperCase()+id.slice(1)}</button>)}</nav>
    <div className="explorer3__drawer-body"><GovernedRecoveryAuditDiagnostics audit={governedRecoveryAudit} diagnostics={governedRecoveryAuditDiagnostics} propertyId={recoveryPropertyId}/><GovernedActionExecutionFeedback feedback={governedActionFeedback} recovery={governedActionRecovery} onReview={handleGovernedReview} onRetry={handleGovernedRetry}/>{SCIIP_ASKING_MARKET_METRIC_UI_PUBLICATION_ENABLED
  ? <SciipAskingMarketMetricDisclosure model={SCIIP_ASKING_MARKET_METRIC_UI_MODEL}/>
  : null}{normalizedSection==='neighbors'?<NeighborPanel rows={rows} summary={neighborIntelligence.summary} onFocus={onFocus} onOpen={onOpenNeighbor}/>:<DrawerSection section={normalizedSection} property={drawerProperty} spatialIdentity={spatialIdentity} lightBoxParcel={lightBoxParcel} liveGovernedIntelligence={liveGovernedIntelligence} lightBoxProxyHealth={lightBoxProxyHealth} lightBoxReadiness={lightBoxReadiness} neighbors={neighbors} plugins={plugins}/>}</div>
    <footer><button><FileText size={14}/>Property Package</button><button className="primary">Recommended Actions <ChevronDown size={14}/></button></footer>
  </aside>;
}

function DrawerSection({section,property,spatialIdentity,lightBoxParcel,liveGovernedIntelligence,lightBoxProxyHealth,lightBoxReadiness,neighbors,plugins}){
  if(section==='property')return <PropertyIntelligence property={property} spatialIdentity={spatialIdentity} lightBoxParcel={lightBoxParcel} liveGovernedIntelligence={liveGovernedIntelligence} lightBoxProxyHealth={lightBoxProxyHealth} lightBoxReadiness={lightBoxReadiness} neighbors={neighbors} plugins={plugins}/>;
  if(section==='market')return <><SectionTitle title="Market Spotlight" subtitle="Industrial context"/><div className="explorer3__detail-grid"><Detail label="Vacancy" value="7.8%"/><Detail label="Market Asking" value="$1.18 NNN"/><Detail label="Demand Score" value="88"/><Detail label="Submarket" value={property.submarket}/></div><SectionTitle title="Live layers" subtitle="Progressive disclosure"/><p className="explorer3__copy">Competition, comparable activity, infrastructure and market events can progressively appear on the map without crowding the default workspace.</p></>;
  if(section==='activity')return <><SectionTitle title="Activity" subtitle="Temporal intelligence"/><Timeline property={property}/></>;
  if(section==='assignment')return <><SectionTitle title="Assignment" subtitle="Workflow context"/><p className="explorer3__copy">{property.assignment?`Active ${property.assignment.type.toLowerCase()} assignment for ${property.assignment.client}.`:'No active assignment is attached to this property.'}</p><button className="explorer3__drawer-cta">{property.assignment?'Open Assignment':'Create Assignment'} <ArrowRight size={14}/></button></>;
  return <PropertyIntelligence property={property} spatialIdentity={spatialIdentity} lightBoxParcel={lightBoxParcel} liveGovernedIntelligence={liveGovernedIntelligence} lightBoxProxyHealth={lightBoxProxyHealth} lightBoxReadiness={lightBoxReadiness} neighbors={neighbors} plugins={plugins}/>;
}

function ProductionEvidenceRuntimeStatus({disclosure,inspection,sourceInspection,traceabilityInspection,lineageIntegrity,certificationGate,certificationAttestation,decisionAuthority,decisionUseContract,decisionContext,consumerRuntime,invocationProvenance,invocationAuditLedger,resultProvenance,resultEvidenceEnvelope,resultCaptureRuntime,resultEvidenceBindingRuntime,resultEvidenceVerificationRuntime,resultEvidencePromotionRuntime,resultEvidencePromotionAuthorizationRuntime,resultEvidencePromotionExecutionRuntime,resultEvidencePromotionCommitRuntime,canonicalCommitExecutionRuntime}){
  if(!disclosure)return null;
  return <section className="explorer3__governed-runtime-status" data-m2-66="production-evidence-status">
    <div className="explorer3__micro-meta">
      <span>Production Evidence</span>
      <strong>{disclosure.badge}</strong>
      <span>{disclosure.status}</span>
      <span>Read-only</span>
    </div>
    {disclosure.status==='DEGRADED'&&<p className="explorer3__copy" data-m2-66="degraded-evidence">{disclosure.message}</p>}
    <details className="explorer3__evidence-runtime-drilldown" data-m2-67="production-evidence-drilldown">
      <summary>Evidence details · {inspection?.readyCount||0}/3 ready</summary>
      <div className="explorer3__detail-grid" data-m2-67="evidence-dimensions">
        {(inspection?.dimensions||[]).map(dimension=><Detail key={dimension.id} label={dimension.label} value={dimension.status}/>)}
      </div>
    </details>
    <details className="explorer3__evidence-source-inspection" data-m2-68="source-level-evidence">
      <summary>Source inspection · {sourceInspection?.availableCount||0}/3 available</summary>
      <div data-m2-68="source-evidence-records">
        {(sourceInspection?.records||[]).map(record=>
          <div className="explorer3__evidence-source-record" data-evidence-dimension={record.id} key={record.id}>
            <div className="explorer3__detail-grid">
              <Detail label={record.label} value={record.value}/>
              <Detail label="Evidence" value={record.status}/>
            </div>
            <p className="explorer3__copy">{record.evidenceClass} · {record.runtimePath}</p>
          </div>
        )}
      </div>
    </details>
    <details className="explorer3__evidence-traceability-inspection" data-m2-69="record-traceability">
      <summary>Record traceability · {traceabilityInspection?.traceableCount||0}/3 traceable</summary>
      <div data-m2-69="origin-records">
        {(traceabilityInspection?.records||[]).map(record=>
          <div className="explorer3__evidence-trace-record" data-trace-key={record.traceKey} key={record.traceKey}>
            <div className="explorer3__detail-grid">
              <Detail label={record.label} value={record.traceabilityState}/>
              <Detail label="Authority" value={record.evidenceAuthority}/>
              <Detail label="Source artifact" value={record.sourceArtifact}/>
              <Detail label="Record key" value={record.sourceRecordKey}/>
            </div>
            <p className="explorer3__copy">{record.originType} · {record.originPath} · {record.originValue}</p>
          </div>
        )}
      </div>
    </details>
    <details className="explorer3__evidence-lineage-integrity" data-m2-70="lineage-integrity">
      <summary>Lineage integrity · {lineageIntegrity?.verifiedCount||0}/3 verified</summary>
      <div data-m2-70="lineage-records">
        {(lineageIntegrity?.records||[]).map(record=>
          <div className="explorer3__evidence-lineage-record" data-lineage-key={record.lineageKey} key={record.lineageKey}>
            <div className="explorer3__detail-grid">
              <Detail label={record.label} value={record.lineageState}/>
              <Detail label="Continuity" value={record.continuity}/>
              <Detail label="Authority" value={record.evidenceAuthority}/>
              <Detail label="Record key" value={record.sourceRecordKey}/>
            </div>
            <p className="explorer3__copy">{record.sourceArtifact} · {record.originPath} · {record.originValue}</p>
          </div>
        )}
      </div>
    </details>
    <details className="explorer3__evidence-certification-gate" data-m2-71="production-evidence-certification">
      <summary>Evidence certification · {certificationGate?.certifiedCount||0}/{certificationGate?.requiredCount||3} certified</summary>
      <div className="explorer3__detail-grid" data-m2-71="certification-gate">
        <Detail label="Certification" value={certificationGate?.status||"NOT_CERTIFIED"}/>
        <Detail label="Gate" value={certificationGate?.gateState||"BLOCK"}/>
        <Detail label="Blocked" value={certificationGate?.blockedCount||0}/>
        <Detail label="Unavailable" value={certificationGate?.unavailableCount||0}/>
      </div>
    </details>
    <details className="explorer3__evidence-certification-attestation" data-m2-72="certification-attestation">
      <summary>Certification attestation · {certificationAttestation?.attestedCount||0}/{certificationAttestation?.requiredCount||3} attested</summary>
      <div className="explorer3__detail-grid" data-m2-72="attestation-audit-record">
        <Detail label="Attestation" value={certificationAttestation?.status||"NOT_ATTESTED"}/>
        <Detail label="Audit record" value={certificationAttestation?.auditState||"BLOCKED"}/>
        <Detail label="Attestation ID" value={certificationAttestation?.attestationId||"UNAVAILABLE"}/>
        <Detail label="Basis" value={certificationAttestation?.basis||"UNAVAILABLE"}/>
      </div>
    </details>
    <details className="explorer3__evidence-decision-authority" data-m2-73="decision-authority">
      <summary>Decision authority · {decisionAuthority?.authorizedCount||0}/{decisionAuthority?.requiredCount||3} authorized</summary>
      <div className="explorer3__detail-grid" data-m2-73="decision-authority-gate">
        <Detail label="Authority" value={decisionAuthority?.status||"WITHHELD"}/>
        <Detail label="Decision state" value={decisionAuthority?.decisionState||"BLOCK"}/>
        <Detail label="Authority ID" value={decisionAuthority?.authorityId||"UNAVAILABLE"}/>
        <Detail label="Attestation" value={decisionAuthority?.attestationId||"UNAVAILABLE"}/>
      </div>
    </details>
    <details className="explorer3__evidence-decision-use-contract" data-m2-74="decision-use-contract">
      <summary>Decision use · {decisionUseContract?.eligibleCount||0}/{decisionUseContract?.requiredCount||3} eligible</summary>
      <div className="explorer3__detail-grid" data-m2-74="consumer-boundary">
        <Detail label="Contract" value={decisionUseContract?.status||"WITHHELD"}/>
        <Detail label="Consumer state" value={decisionUseContract?.consumerState||"BLOCKED"}/>
        <Detail label="Contract ID" value={decisionUseContract?.contractId||"UNAVAILABLE"}/>
        <Detail label="Authority" value={decisionUseContract?.authorityId||"UNAVAILABLE"}/>
      </div>
    </details>
    <details className="explorer3__governed-decision-context" data-m2-75="governed-decision-context">
      <summary>Decision context · {decisionContext?.readyCount||0}/{decisionContext?.requiredCount||3} ready</summary>
      <div className="explorer3__detail-grid" data-m2-75="consumer-handoff">
        <Detail label="Context" value={decisionContext?.status||"WITHHELD"}/>
        <Detail label="Context state" value={decisionContext?.contextState||"BLOCKED"}/>
        <Detail label="Context ID" value={decisionContext?.contextId||"UNAVAILABLE"}/>
        <Detail label="Property" value={decisionContext?.propertyId||"UNAVAILABLE"}/>
      </div>
      <div className="explorer3__detail-grid" data-m2-75="consumer-bindings">
        {(decisionContext?.consumerBindings||[]).map(binding=>
          <Detail key={binding.consumer} label={binding.consumer} value={binding.state}/>
        )}
      </div>
    </details>
    <details className="explorer3__consumer-context-runtime" data-m2-76="consumer-context-runtime">
      <summary>Consumer runtime · {consumerRuntime?.boundCount||0}/{consumerRuntime?.consumerCount||4} bound</summary>
      <div className="explorer3__detail-grid" data-m2-76="shared-context">
        <Detail label="Runtime" value={consumerRuntime?.status||"BLOCKED"}/>
        <Detail label="Runtime state" value={consumerRuntime?.runtimeState||"BLOCKED"}/>
        <Detail label="Runtime ID" value={consumerRuntime?.runtimeId||"UNAVAILABLE"}/>
        <Detail label="Context ID" value={consumerRuntime?.contextId||"UNAVAILABLE"}/>
      </div>
      <div className="explorer3__detail-grid" data-m2-76="consumer-runtime-bindings">
        {(consumerRuntime?.bindings||[]).map(binding=>
          <Detail key={binding.consumer} label={binding.consumer} value={binding.state}/>
        )}
      </div>
    </details>
    <details className="explorer3__consumer-invocation-provenance" data-m2-77="consumer-invocation-provenance">
      <summary>Invocation provenance · {invocationProvenance?.invocableCount||0}/{invocationProvenance?.consumerCount||4} attributable</summary>
      <div className="explorer3__detail-grid" data-m2-77="invocation-provenance-summary">
        <Detail label="Invocation" value={invocationProvenance?.status||"BLOCKED"}/>
        <Detail label="State" value={invocationProvenance?.invocationState||"BLOCKED"}/>
        <Detail label="Provenance ID" value={invocationProvenance?.provenanceId||"UNAVAILABLE"}/>
        <Detail label="Runtime ID" value={invocationProvenance?.runtimeId||"UNAVAILABLE"}/>
      </div>
      <div className="explorer3__detail-grid" data-m2-77="invocation-records">
        {(invocationProvenance?.invocations||[]).map(invocation=>
          <Detail key={invocation.consumer} label={invocation.consumer} value={invocation.provenanceState}/>
        )}
      </div>
    </details>
    <details className="explorer3__consumer-invocation-audit-ledger" data-m2-78="invocation-audit-ledger">
      <summary>Invocation audit · {invocationAuditLedger?.recordedCount||0}/{invocationAuditLedger?.consumerCount||4} recorded</summary>
      <div className="explorer3__detail-grid" data-m2-78="audit-ledger-summary">
        <Detail label="Audit" value={invocationAuditLedger?.status||"BLOCKED"}/>
        <Detail label="Ledger state" value={invocationAuditLedger?.ledgerState||"BLOCKED"}/>
        <Detail label="Ledger ID" value={invocationAuditLedger?.ledgerId||"UNAVAILABLE"}/>
        <Detail label="Occurred at" value={invocationAuditLedger?.occurredAt||"UNRECORDED"}/>
      </div>
      <div className="explorer3__detail-grid" data-m2-78="audit-event-records">
        {(invocationAuditLedger?.events||[]).map(event=>
          <Detail key={event.consumer} label={event.consumer} value={event.auditState}/>
        )}
      </div>
    </details>
    <details className="explorer3__consumer-result-provenance" data-m2-79="result-provenance">
      <summary>Result provenance · {resultProvenance?.provenanceReadyCount||0}/{resultProvenance?.consumerCount||4} ready</summary>
      <div className="explorer3__detail-grid" data-m2-79="result-provenance-summary">
        <Detail label="Provenance" value={resultProvenance?.status||"BLOCKED"}/>
        <Detail label="State" value={resultProvenance?.provenanceState||"BLOCKED"}/>
        <Detail label="Captured" value={`${resultProvenance?.capturedCount||0}/${resultProvenance?.consumerCount||4}`}/>
        <Detail label="Awaiting" value={`${resultProvenance?.awaitingCount||0}`}/>
      </div>
      <div className="explorer3__detail-grid" data-m2-79="result-provenance-records">
        {(resultProvenance?.records||[]).map(record=>
          <Detail key={record.consumer} label={record.consumer} value={record.resultState}/>
        )}
      </div>
    </details>
    <details className="explorer3__consumer-result-evidence-envelope" data-m2-80="result-evidence-envelope">
      <summary>Result evidence · {resultEvidenceEnvelope?.sealedCount||0}/{resultEvidenceEnvelope?.consumerCount||4} sealed</summary>
      <div className="explorer3__detail-grid" data-m2-80="result-evidence-summary">
        <Detail label="Envelope" value={resultEvidenceEnvelope?.status||"BLOCKED"}/>
        <Detail label="State" value={resultEvidenceEnvelope?.envelopeState||"BLOCKED"}/>
        <Detail label="Awaiting result" value={`${resultEvidenceEnvelope?.awaitingResultCount||0}`}/>
        <Detail label="Awaiting evidence" value={`${resultEvidenceEnvelope?.awaitingEvidenceCount||0}`}/>
      </div>
      <div className="explorer3__detail-grid" data-m2-80="result-evidence-records">
        {(resultEvidenceEnvelope?.envelopes||[]).map(envelope=>
          <Detail key={envelope.consumer} label={envelope.consumer} value={envelope.state}/>
        )}
      </div>
    </details>
    <details className="explorer3__consumer-result-capture-runtime" data-m2-81="result-capture-runtime">
      <summary>Result capture · {resultCaptureRuntime?.capturedCount||0}/{resultCaptureRuntime?.consumerCount||4} captured</summary>
      <div className="explorer3__detail-grid" data-m2-81="result-capture-summary">
        <Detail label="Capture" value={resultCaptureRuntime?.status||"BLOCKED"}/>
        <Detail label="State" value={resultCaptureRuntime?.captureState||"BLOCKED"}/>
        <Detail label="Sealed" value={`${resultCaptureRuntime?.sealedCount||0}/${resultCaptureRuntime?.consumerCount||4}`}/>
        <Detail label="Pending evidence" value={`${resultCaptureRuntime?.pendingEvidenceCount||0}`}/>
      </div>
      <div className="explorer3__detail-grid" data-m2-81="result-capture-records">
        {(resultCaptureRuntime?.records||[]).map(record=>
          <Detail key={record.consumer} label={record.consumer} value={record.state}/>
        )}
      </div>
    </details>
    <details className="explorer3__consumer-result-evidence-binding-runtime" data-m2-82="result-evidence-binding-runtime">
      <summary>Evidence binding · {resultEvidenceBindingRuntime?.sealedCount||0}/{resultEvidenceBindingRuntime?.consumerCount||4} sealed</summary>
      <div className="explorer3__detail-grid" data-m2-82="result-evidence-binding-summary">
        <Detail label="Binding" value={resultEvidenceBindingRuntime?.status||"BLOCKED"}/>
        <Detail label="State" value={resultEvidenceBindingRuntime?.bindingState||"BLOCKED"}/>
        <Detail label="Pending evidence" value={`${resultEvidenceBindingRuntime?.pendingEvidenceCount||0}`}/>
        <Detail label="Awaiting result" value={`${resultEvidenceBindingRuntime?.awaitingResultCount||0}`}/>
      </div>
      <div className="explorer3__detail-grid" data-m2-82="result-evidence-binding-records">
        {(resultEvidenceBindingRuntime?.records||[]).map(record=>
          <Detail key={record.consumer} label={record.consumer} value={record.state}/>
        )}
      </div>
    </details>
    <details className="explorer3__consumer-result-evidence-verification-runtime" data-m2-83="result-evidence-verification-runtime">
      <summary>Evidence verification · {resultEvidenceVerificationRuntime?.verifiedCount||0}/{resultEvidenceVerificationRuntime?.consumerCount||4} verified</summary>
      <div className="explorer3__detail-grid" data-m2-83="result-evidence-verification-summary">
        <Detail label="Verification" value={resultEvidenceVerificationRuntime?.status||"BLOCKED"}/>
        <Detail label="State" value={resultEvidenceVerificationRuntime?.verificationState||"BLOCKED"}/>
        <Detail label="Review required" value={`${resultEvidenceVerificationRuntime?.reviewRequiredCount||0}`}/>
        <Detail label="Rejected" value={`${resultEvidenceVerificationRuntime?.rejectedCount||0}`}/>
      </div>
      <div className="explorer3__detail-grid" data-m2-83="result-evidence-verification-records">
        {(resultEvidenceVerificationRuntime?.records||[]).map(record=>
          <Detail key={record.consumer} label={record.consumer} value={record.state}/>
        )}
      </div>
    </details>
    <details className="explorer3__consumer-result-evidence-promotion-runtime" data-m2-84="result-evidence-promotion-runtime">
      <summary>Promotion eligibility · {resultEvidencePromotionRuntime?.eligibleCount||0}/{resultEvidencePromotionRuntime?.consumerCount||4} eligible</summary>
      <div className="explorer3__detail-grid" data-m2-84="result-evidence-promotion-summary">
        <Detail label="Promotion" value={resultEvidencePromotionRuntime?.status||"BLOCKED"}/>
        <Detail label="State" value={resultEvidencePromotionRuntime?.promotionState||"BLOCKED"}/>
        <Detail label="Review required" value={`${resultEvidencePromotionRuntime?.reviewRequiredCount||0}`}/>
        <Detail label="Rejected" value={`${resultEvidencePromotionRuntime?.rejectedCount||0}`}/>
      </div>
      <div className="explorer3__detail-grid" data-m2-84="result-evidence-promotion-records">
        {(resultEvidencePromotionRuntime?.records||[]).map(record=>
          <Detail key={record.consumer} label={record.consumer} value={record.state}/>
        )}
      </div>
    </details>
    <details className="explorer3__consumer-result-evidence-promotion-authorization-runtime" data-m2-85="promotion-authorization-runtime">
      <summary>Promotion authorization · {resultEvidencePromotionAuthorizationRuntime?.authorizedCount||0}/{resultEvidencePromotionAuthorizationRuntime?.consumerCount||4} authorized</summary>
      <div className="explorer3__detail-grid" data-m2-85="promotion-authorization-summary">
        <Detail label="Authorization" value={resultEvidencePromotionAuthorizationRuntime?.status||"BLOCKED"}/>
        <Detail label="State" value={resultEvidencePromotionAuthorizationRuntime?.authorizationState||"BLOCKED"}/>
        <Detail label="Pending" value={`${resultEvidencePromotionAuthorizationRuntime?.pendingAuthorizationCount||0}`}/>
        <Detail label="Denied" value={`${resultEvidencePromotionAuthorizationRuntime?.deniedCount||0}`}/>
      </div>
      <div className="explorer3__detail-grid" data-m2-85="promotion-authorization-records">
        {(resultEvidencePromotionAuthorizationRuntime?.records||[]).map(record=>
          <Detail key={record.consumer} label={record.consumer} value={record.state}/>
        )}
      </div>
    </details>
    <details className="explorer3__consumer-result-evidence-promotion-execution-runtime" data-m2-86="promotion-execution-runtime">
      <summary>Promotion execution · {resultEvidencePromotionExecutionRuntime?.executedCount||0}/{resultEvidencePromotionExecutionRuntime?.consumerCount||4} executed</summary>
      <div className="explorer3__detail-grid" data-m2-86="promotion-execution-summary">
        <Detail label="Execution" value={resultEvidencePromotionExecutionRuntime?.status||"BLOCKED"}/>
        <Detail label="State" value={resultEvidencePromotionExecutionRuntime?.executionState||"BLOCKED"}/>
        <Detail label="Awaiting request" value={`${resultEvidencePromotionExecutionRuntime?.awaitingExecutionRequestCount||0}`}/>
        <Detail label="Not authorized" value={`${resultEvidencePromotionExecutionRuntime?.notAuthorizedCount||0}`}/>
      </div>
      <div className="explorer3__detail-grid" data-m2-86="promotion-execution-records">
        {(resultEvidencePromotionExecutionRuntime?.records||[]).map(record=>
          <Detail key={record.consumer} label={record.consumer} value={record.state}/>
        )}
      </div>
    </details>
    <details className="explorer3__consumer-result-evidence-promotion-commit-runtime" data-m2-87="promotion-commit-runtime">
      <summary>Commit candidates · {resultEvidencePromotionCommitRuntime?.candidateCount||0}/{resultEvidencePromotionCommitRuntime?.consumerCount||4} awaiting approval</summary>
      <div className="explorer3__detail-grid" data-m2-87="promotion-commit-summary">
        <Detail label="Commit runtime" value={resultEvidencePromotionCommitRuntime?.status||"BLOCKED"}/>
        <Detail label="State" value={resultEvidencePromotionCommitRuntime?.commitState||"BLOCKED"}/>
        <Detail label="Candidates" value={`${resultEvidencePromotionCommitRuntime?.candidateCount||0}`}/>
        <Detail label="Auto commit" value="OFF"/>
      </div>
      <div className="explorer3__detail-grid" data-m2-87="promotion-commit-records">
        {(resultEvidencePromotionCommitRuntime?.records||[]).map(record=>
          <Detail key={record.consumer} label={record.consumer} value={record.state}/>
        )}
      </div>
    </details>
    <details className="explorer3__canonical-commit-execution-runtime" data-m2-89="canonical-commit-execution-runtime">
      <summary>Canonical commit · {canonicalCommitExecutionRuntime?.committedCount||0}/{canonicalCommitExecutionRuntime?.consumerCount||4} committed</summary>
      <div className="explorer3__detail-grid" data-m2-89="canonical-commit-summary">
        <Detail label="Commit execution" value={canonicalCommitExecutionRuntime?.status||"BLOCKED"}/>
        <Detail label="Authorized" value={`${canonicalCommitExecutionRuntime?.authorizedCount||0}`}/>
        <Detail label="Awaiting authorization" value={`${canonicalCommitExecutionRuntime?.awaitingAuthorizationCount||0}`}/>
        <Detail label="Canonical writes" value="OFF"/>
      </div>
      <div className="explorer3__detail-grid" data-m2-89="canonical-commit-records">
        {(canonicalCommitExecutionRuntime?.records||[]).map(record=>
          <Detail key={record.consumer} label={record.consumer} value={record.state}/>
        )}
      </div>
    </details>
  </section>;
}

function PropertyIntelligence({property,spatialIdentity,lightBoxParcel,liveGovernedIntelligence,lightBoxProxyHealth,lightBoxReadiness,neighbors,plugins}){
  // M2.31: product-facing consumers resolve through the governed runtime.
  // Raw reconciliation/evidence inputs remain separate props and are not mutated.
  const sourceProperty=property;
  // M2.50: property-scoped reactive refresh from M2.49 governed action events.
  const governedActionRefresh=useGovernedPropertyIntelligenceActionRefresh(sourceProperty);
  const governedActionRevision=governedActionRefresh.revision;
  // M2.53: presentation-only optimistic execution projection.
  const[governedOptimisticExecution,setGovernedOptimisticExecution]=useState(null);
  useEffect(()=>{
    const e=governedActionRefresh.lastEvent;
    if(!e||!governedOptimisticExecution)return;
    if(e.propertyId!==governedOptimisticExecution.propertyId)return;
    if(e.action!==governedOptimisticExecution.action)return;
    setGovernedOptimisticExecution(
      reconcileGovernedActionExecution(governedOptimisticExecution,e.result||e,null)
    );
  },[governedActionRefresh.revision]);
  const governedActionState=useMemo(
    ()=>resolveGovernedPropertyIntelligenceActionState({property:sourceProperty,lastEvent:governedActionRefresh.lastEvent,revision:governedActionRevision}),
    [sourceProperty,governedActionRefresh.lastEvent,governedActionRevision]
  );
  // M2.52: controls project valid next transitions from governed action state.
  const governedActionControls=useMemo(
    ()=>resolveGovernedPropertyIntelligenceActionControls(governedActionState),
    [governedActionState]
  );
  const enforceGovernedActionTransition=event=>{
    const control=event.target?.closest?.('button');
    if(!control)return;
    const action=inferGovernedPropertyIntelligenceActionFromControl(control);
    if(!action)return;
    if(isGovernedPropertyIntelligenceActionAllowed(governedActionControls,action))return;
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent?.stopImmediatePropagation?.();
  };
  const governedConsumerRuntime=useMemo(
    ()=>resolveGovernedExplorerConsumerRuntime(sourceProperty,{
    property:sourceProperty,
    spatialIdentity,
    lightBoxParcel,
    liveGovernedIntelligence
  }),
    [sourceProperty,spatialIdentity,lightBoxParcel,liveGovernedIntelligence,governedActionRevision]
  );
  property=governedConsumerRuntime.property||sourceProperty;
  const snapshot=useMemo(()=>propertyIntelligenceSnapshot(property,{lightBoxParcel,lightBoxReadiness}),[property,lightBoxParcel,lightBoxReadiness]);
  const governedProvenanceStatus=property?.provenance?.gateStatus||property?.provenance?.status||'UNVERIFIED';
  const governedSourceType=property?.provenance?.sourceType||'UNVERIFIED';
  const governedSpatialSource=property?.provenance?.geometrySource?.file||null;
  // M2.64: self-checking production evidence contract. Read-only.
  const productionEvidenceRuntimeConsistency=useMemo(
    ()=>buildProductionEvidenceRuntimeConsistency({
      provenanceStatus:governedProvenanceStatus,
      sourceType:governedSourceType,
      spatialSource:governedSpatialSource
    }),
    [governedProvenanceStatus,governedSourceType,governedSpatialSource]
  );
  // M2.65: operator-visible, read-only presentation of M2.64 evidence health.
  const productionEvidenceRuntimeStatusPresentation=useMemo(
    ()=>buildProductionEvidenceRuntimeStatusPresentation(productionEvidenceRuntimeConsistency),
    [productionEvidenceRuntimeConsistency]
  );
  // M2.66 FINAL: read-only operator disclosure over M2.65.
  const productionEvidenceRuntimeDisclosure=useMemo(
    ()=>buildProductionEvidenceRuntimeDisclosure(productionEvidenceRuntimeStatusPresentation),
    [productionEvidenceRuntimeStatusPresentation]
  );
  // M2.67: read-only drilldown across the three production evidence dimensions.
  const productionEvidenceRuntimeInspection=useMemo(
    ()=>buildProductionEvidenceRuntimeInspection(productionEvidenceRuntimeDisclosure),
    [productionEvidenceRuntimeDisclosure]
  );
  // M2.68: read-only source-level evidence records behind the M2.67 dimensions.
  const productionEvidenceSourceInspection=useMemo(
    ()=>buildProductionEvidenceSourceInspection({
      inspection:productionEvidenceRuntimeInspection,
      provenanceStatus:governedProvenanceStatus,
      sourceType:governedSourceType,
      spatialSource:governedSpatialSource
    }),
    [productionEvidenceRuntimeInspection,governedProvenanceStatus,governedSourceType,governedSpatialSource]
  );
  // M2.69: read-only record traceability and origin inspection over M2.68 source evidence.
  const productionEvidenceTraceabilityInspection=useMemo(
    ()=>buildProductionEvidenceTraceabilityInspection(productionEvidenceSourceInspection),
    [productionEvidenceSourceInspection]
  );
  // M2.70: verify end-to-end lineage continuity over M2.69 traceability records.
  const productionEvidenceLineageIntegrity=useMemo(
    ()=>buildProductionEvidenceLineageIntegrity(productionEvidenceTraceabilityInspection),
    [productionEvidenceTraceabilityInspection]
  );
  // M2.71: certify the complete read-only production evidence chain.
  const productionEvidenceCertificationGate=useMemo(
    ()=>buildProductionEvidenceCertificationGate(productionEvidenceLineageIntegrity),
    [productionEvidenceLineageIntegrity]
  );
  // M2.72: materialize a deterministic, read-only attestation of the certification decision.
  const productionEvidenceCertificationAttestation=useMemo(
    ()=>buildProductionEvidenceCertificationAttestation(productionEvidenceCertificationGate),
    [productionEvidenceCertificationGate]
  );
  // M2.73: explicit read-only decision authority over certified, attested evidence.
  const productionEvidenceDecisionAuthority=useMemo(
    ()=>buildProductionEvidenceDecisionAuthority(productionEvidenceCertificationAttestation),
    [productionEvidenceCertificationAttestation]
  );
  // M2.74: publish a read-only consumer contract only from M2.73 authorized evidence.
  const productionEvidenceDecisionUseContract=useMemo(
    ()=>buildProductionEvidenceDecisionUseContract(productionEvidenceDecisionAuthority),
    [productionEvidenceDecisionAuthority]
  );
  // M2.75: property-scoped, read-only consumer handoff over the M2.74 decision-use contract.
  const governedDecisionContext=useMemo(
    ()=>buildGovernedDecisionContext({
      decisionUseContract:productionEvidenceDecisionUseContract,
      property:sourceProperty
    }),
    [productionEvidenceDecisionUseContract,sourceProperty]
  );
  // M2.76: one shared, read-only governed context runtime for all downstream consumers.
  const governedConsumerContextRuntime=useMemo(
    ()=>buildGovernedConsumerContextRuntime(governedDecisionContext),
    [governedDecisionContext]
  );
  // M2.77: deterministic, attributable invocation provenance over the shared M2.76 runtime.
  const governedConsumerInvocationProvenance=useMemo(
    ()=>buildGovernedConsumerInvocationProvenance(governedConsumerContextRuntime),
    [governedConsumerContextRuntime]
  );
  // M2.78: append-only temporal audit envelope over M2.77 invocation provenance.
  const governedConsumerInvocationAuditLedger=useMemo(
    ()=>buildGovernedConsumerInvocationAuditLedger(
      governedConsumerInvocationProvenance,
      new Date().toISOString()
    ),
    [governedConsumerInvocationProvenance]
  );
  // M2.79: result provenance envelopes bind future real consumer results to the exact M2.78 audit lineage.
  // No result is fabricated here; absent consumer output remains AWAITING_CONSUMER_RESULT.
  const governedConsumerInvocationResultProvenance=useMemo(
    ()=>buildGovernedConsumerInvocationResultProvenance(
      governedConsumerInvocationAuditLedger,
      {}
    ),
    [governedConsumerInvocationAuditLedger]
  );
  // M2.80: bind real consumer results to evidence references without fabricating missing output.
  const governedConsumerResultEvidenceEnvelope=useMemo(
    ()=>buildGovernedConsumerResultEvidenceEnvelope(
      governedConsumerInvocationResultProvenance,
      {},
      {}
    ),
    [governedConsumerInvocationResultProvenance]
  );
  // M2.81: explicit capture boundary for real downstream consumer outputs.
  // Empty inputs preserve AWAITING_RESULT and never fabricate output or evidence.
  const governedConsumerResultCaptureRuntime=useMemo(
    ()=>buildGovernedConsumerResultCaptureRuntime({
      resultEvidenceEnvelope:governedConsumerResultEvidenceEnvelope,
      consumerResults:{},
      consumerEvidence:{}
    }),
    [governedConsumerResultEvidenceEnvelope]
  );
  // M2.82: bind real evidence references to captured downstream results.
  const governedConsumerResultEvidenceBindingRuntime=useMemo(
    ()=>buildGovernedConsumerResultEvidenceBindingRuntime({
      resultCaptureRuntime:governedConsumerResultCaptureRuntime,
      consumerEvidence:{}
    }),
    [governedConsumerResultCaptureRuntime]
  );
  // M2.83: verify integrity, lineage, temporal validity, and tamper state of bound evidence.
  const governedConsumerResultEvidenceVerificationRuntime=useMemo(
    ()=>buildGovernedConsumerResultEvidenceVerificationRuntime(
      governedConsumerResultEvidenceBindingRuntime
    ),
    [governedConsumerResultEvidenceBindingRuntime]
  );
  // M2.84: derive promotion eligibility from VERIFIED evidence without executing promotion.
  const governedConsumerResultEvidencePromotionRuntime=useMemo(
    ()=>buildGovernedConsumerResultEvidencePromotionRuntime(
      governedConsumerResultEvidenceVerificationRuntime
    ),
    [governedConsumerResultEvidenceVerificationRuntime]
  );
  // M2.85: authorization boundary only. No promotion is executed here.
  const governedConsumerResultEvidencePromotionAuthorizationRuntime=useMemo(
    ()=>buildGovernedConsumerResultEvidencePromotionAuthorizationRuntime(
      governedConsumerResultEvidencePromotionRuntime,
      {}
    ),
    [governedConsumerResultEvidencePromotionRuntime]
  );
  // M2.86: explicit promotion execution request boundary.
  const governedConsumerResultEvidencePromotionExecutionRuntime=useMemo(
    ()=>buildGovernedConsumerResultEvidencePromotionExecutionRuntime(
      governedConsumerResultEvidencePromotionAuthorizationRuntime,
      {}
    ),
    [governedConsumerResultEvidencePromotionAuthorizationRuntime]
  );
  // M2.87: append-only commit candidates; explicit commit approval remains a future boundary.
  const governedConsumerResultEvidencePromotionCommitRuntime=useMemo(
    ()=>buildGovernedConsumerResultEvidencePromotionCommitRuntime(
      governedConsumerResultEvidencePromotionExecutionRuntime
    ),
    [governedConsumerResultEvidencePromotionExecutionRuntime]
  );
  // M2.89: controlled canonical commit boundary. No authorization artifacts are fabricated.
  const governedCanonicalCommitExecutionRuntime=useMemo(
    ()=>buildGovernedCanonicalCommitExecutionRuntime(
      governedConsumerResultEvidencePromotionCommitRuntime,
      {}
    ),
    [governedConsumerResultEvidencePromotionCommitRuntime]
  );


  const sections=useMemo(()=>visibleSections(property,{lightBoxParcel,lightBoxReadiness,neighbors})
    .map(section=>({...section,status:sectionStatus(section.id,property,{lightBoxParcel,lightBoxReadiness,neighbors})})),
    [property,lightBoxParcel,lightBoxReadiness,neighbors]);
  const[activeSection,setActiveSection]=useState('snapshot');

  useEffect(()=>{
    if(!sections.some(section=>section.id===activeSection))setActiveSection(sections[0]?.id||'snapshot');
  },[sections,activeSection]);

  const active=sections.find(section=>section.id===activeSection)||sections[0];

  // M2.47: evidence-facing presentation resolves from the governed PI runtime.
  const governedPropertyIntelligenceEvidenceRuntime=
    resolveGovernedPropertyIntelligenceEvidenceRuntime({
      property:sourceProperty,
      governedConsumerRuntime,
      liveGovernedIntelligence,
      governedEvidence:{
        status:governedProvenanceStatus,
        sourceType:governedSourceType,
        spatialSource:governedSpatialSource
      }
    });

  const beginGovernedOptimisticExecution=(action,fieldKey=null,decision=null)=>{
    const projection=beginOptimisticGovernedAction({
      action,
      property:sourceProperty,
      fieldKey,
      decision,
      revision:governedActionRevision
    });
    setGovernedOptimisticExecution(projection);
    return projection;
  };

  return <div className="explorer3__pi-progressive" data-governed-action-state={governedActionState.state} data-governed-action-revision={governedActionState.revision} data-governed-allowed-actions={governedActionControls.allowedActions.join(',')} onClickCapture={enforceGovernedActionTransition}>
    <div className="explorer3__provenance-contract" data-provenance-status={governedProvenanceStatus} data-source-type={governedSourceType} data-spatial-source={governedSpatialSource||'NONE'}><span>Governed</span><strong>{governedProvenanceStatus}</strong><em>{governedSourceType}</em></div>
    <ProductionEvidenceRuntimeStatus disclosure={productionEvidenceRuntimeDisclosure} inspection={productionEvidenceRuntimeInspection} sourceInspection={productionEvidenceSourceInspection} traceabilityInspection={productionEvidenceTraceabilityInspection} lineageIntegrity={productionEvidenceLineageIntegrity} certificationGate={productionEvidenceCertificationGate} certificationAttestation={productionEvidenceCertificationAttestation} decisionAuthority={productionEvidenceDecisionAuthority} decisionUseContract={productionEvidenceDecisionUseContract} decisionContext={governedDecisionContext} consumerRuntime={governedConsumerContextRuntime} invocationProvenance={governedConsumerInvocationProvenance} invocationAuditLedger={governedConsumerInvocationAuditLedger} resultProvenance={governedConsumerInvocationResultProvenance} resultEvidenceEnvelope={governedConsumerResultEvidenceEnvelope} resultCaptureRuntime={governedConsumerResultCaptureRuntime} resultEvidenceBindingRuntime={governedConsumerResultEvidenceBindingRuntime} resultEvidenceVerificationRuntime={governedConsumerResultEvidenceVerificationRuntime} resultEvidencePromotionRuntime={governedConsumerResultEvidencePromotionRuntime} resultEvidencePromotionAuthorizationRuntime={governedConsumerResultEvidencePromotionAuthorizationRuntime} resultEvidencePromotionExecutionRuntime={governedConsumerResultEvidencePromotionExecutionRuntime} resultEvidencePromotionCommitRuntime={governedConsumerResultEvidencePromotionCommitRuntime} canonicalCommitExecutionRuntime={governedCanonicalCommitExecutionRuntime}/>
    <LightBoxConnectionBadge state={lightBoxProxyHealth}/>
    <LiveGovernedPropertyCard model={liveGovernedIntelligence}/>
    <PropertyMetricRail snapshot={snapshot}/>
    <PropertyIntelligenceNavigator sections={sections} activeSection={activeSection} onSelect={setActiveSection}/>
    <div className="explorer3__pi-section-head">
      <div><span>PROPERTY INTELLIGENCE</span><strong>{active?.label||'Snapshot'}</strong></div>
      <em>{active?.status||'AVAILABLE'}</em>
    </div>
    <PropertyIntelligenceSectionHost
      sectionId={activeSection}
      property={property}
      snapshot={snapshot}
      spatialIdentity={spatialIdentity}
      lightBoxParcel={lightBoxParcel}
      lightBoxReadiness={lightBoxReadiness}
      neighbors={neighbors}
      plugins={plugins}
      governedEvidence={governedPropertyIntelligenceEvidenceRuntime} governedOptimisticExecution={governedOptimisticExecution} onBeginGovernedOptimisticExecution={beginGovernedOptimisticExecution}
    />
  </div>;
}

function ContextualTransactionDetails({property}){
  if(property.recordType==='AVAILABLE')return <DisclosureSection title="Availability" subtitle="Current offering" defaultOpen><div className="explorer3__detail-grid"><Detail label="Available SF" value={formatNumber(property.availableSf)}/><Detail label="Divisible To" value={formatNumber(property.divisibleSf)}/><Detail label="Asking Rate" value={moneyRate(property.askingRate)}/><Detail label="OPEX" value={moneyRate(property.opex)}/><Detail label="Available" value={property.availabilityDate||'—'}/><Detail label="Term" value={property.term||'—'}/></div></DisclosureSection>;
  if(property.recordType==='LEASE_COMPARABLE')return <DisclosureSection title="Lease Comparable" subtitle="Transaction context" defaultOpen><div className="explorer3__detail-grid"><Detail label="Comp Rate" value={moneyRate(property.compRate)}/><Detail label="Comp Date" value={property.compDate||'—'}/><Detail label="Term" value={property.compTerm||'—'}/><Detail label="Tenant" value={property.tenant||'—'}/><Detail label="Concessions" value={property.concessions||'—'}/><Detail label="TI Allowance" value={property.tiAllowance||'—'}/></div></DisclosureSection>;
  if(property.recordType==='SALE_COMPARABLE')return <DisclosureSection title="Sale Comparable" subtitle="Transaction context" defaultOpen><div className="explorer3__detail-grid"><Detail label="Sale Price" value={property.salePrice?`$${Number(property.salePrice).toLocaleString()}`:'—'}/><Detail label="$ / SF" value={property.pricePerSf?`$${property.pricePerSf}`:'—'}/><Detail label="Comp Date" value={property.compDate||'—'}/><Detail label="Cap Rate" value={property.capRate||'—'}/><Detail label="Buyer" value={property.buyer||'—'}/><Detail label="Seller" value={property.seller||'—'}/></div></DisclosureSection>;
  return <DisclosureSection title="Record Context" subtitle="Base inventory"><div className="explorer3__detail-grid"><Detail label="Asking Rate" value={property.askingRate?moneyRate(property.askingRate):'—'}/><Detail label="OPEX" value={property.opex?moneyRate(property.opex):'—'}/><Detail label="Availability" value={property.availabilityDate||'—'}/><Detail label="Record Type" value={recordTypeLabel(property.recordType)}/></div></DisclosureSection>;
}

function DisclosureSection({title,subtitle,defaultOpen=false,children}){return <details className="explorer3__disclosure" open={defaultOpen}><summary><div><strong>{title}</strong><span>{subtitle}</span></div><ChevronDown className="explorer3__disclosure-chevron" size={15}/></summary><div className="explorer3__disclosure-body">{children}</div></details>;}

function NeighborPanel({rows,summary,onFocus,onOpen}){return <><SectionTitle title="Neighbor Intelligence" subtitle={`${rows.length} properties identified`}/><p className="explorer3__copy">{summary}</p><div className="explorer3__neighbor-list">{rows.map(row=><article key={`${row.direction}-${row.property.id}`}><button className="explorer3__neighbor-main" onMouseEnter={()=>onFocus(row.property.id)} onMouseLeave={()=>onFocus(null)} onClick={()=>onFocus(row.property.id)}><span>{row.relationshipType==='ADJOINING'?'Adjacent':row.direction}</span><strong>{row.property.address}</strong><small>{row.distanceFeet===0?'Shared boundary':`${Math.round(row.distanceFeet).toLocaleString()} ft`} · {Number(row.property.buildingSf||0).toLocaleString()} SF</small><small>{row.property.owner}</small></button><button className="explorer3__neighbor-open" onClick={()=>onOpen(row.property.id)}>Open <ArrowRight size={13}/></button></article>)}</div></>}
function SectionTitle({title,subtitle}){return <header className="explorer3__section-title"><div><strong>{title}</strong><span>{subtitle}</span></div></header>;}
function Detail({label,value}){return <article><span>{label}</span><strong>{value}</strong></article>;}
function Timeline({property}){return <div className="explorer3__timeline"><article><i/><div><strong>Explorer intelligence refreshed</strong><span>Today · governed market state</span></div></article><article><i/><div><strong>{property.source||'Canonical'} property context synchronized</strong><span>Identity + GIS + transaction context</span></div></article><article><i/><div><strong>Map visibility and executive intelligence available</strong><span>Persistent workspace context</span></div></article></div>;}

function CompareDock({ids,onRemove,properties=[]}){const rows=ids.map(id=>properties.find(p=>p.id===id)).filter(Boolean);return <section className="explorer3__compare-dock"><strong>Compare {rows.length}</strong>{rows.map(row=><button key={row.id} onClick={()=>onRemove(row.id)}>{row.address}<X size={12}/></button>)}<button className="primary">Open Compare</button></section>;}

function formatNumber(value){const number=Number(value)||0;return number?number.toLocaleString():'—';}
function moneyRate(value){return Number(value)?`$${Number(value).toFixed(2)} NNN`:'—';}
function recordTypeLabel(value){return({BASE_INVENTORY:'Base Inventory',AVAILABLE:'Available',LEASE_COMPARABLE:'Lease Comparable',SALE_COMPARABLE:'Sale Comparable'}[value]||'Property');}

// SCIIP_A10AH_LIVE_POSTGRES_PANEL
function SCIIPPostgresReadPanel(){
  const [state,setState]=SCIIPPostgresReact.useState({status:'idle',data:null,error:null});

  async function loadPostgresReadModel(){
    setState({status:'loading',data:null,error:null});
    try{
      const [health,assets,buildings,listings]=await Promise.all([
        readPostgresHealth(),
        readPostgresAssets({limit:3,offset:0}),
        readPostgresBuildings({limit:3,offset:0}),
        readPostgresListings({limit:3,offset:0}),
      ]);
      setState({
        status:'ready',
        data:{
          health,
          assets:assets.rows,
          buildings:buildings.rows,
          listings:listings.rows,
        },
        error:null,
      });
    }catch(error){
      setState({status:'error',data:null,error});
    }
  }

  return <aside
    aria-label="PostgreSQL live read model"
    style={{
      position:'fixed',
      right:16,
      bottom:16,
      zIndex:2147483000,
      width:320,
      maxHeight:'70vh',
      overflow:'auto',
      background:'rgba(255,255,255,0.97)',
      border:'1px solid rgba(15,23,42,0.18)',
      borderRadius:10,
      boxShadow:'0 12px 32px rgba(15,23,42,0.18)',
      padding:12,
      color:'#0f172a',
      fontSize:12,
      lineHeight:1.4,
    }}
  >
    <strong style={{display:'block',fontSize:13,marginBottom:4}}>PostgreSQL Live Read</strong>
    <span style={{display:'block',opacity:0.72,marginBottom:8}}>Optional - read-only - Explorer baseline unchanged</span>
    <button
      type="button"
      onClick={loadPostgresReadModel}
      disabled={state.status==='loading'}
      style={{cursor:'pointer',padding:'6px 9px'}}
    >
      {state.status==='loading'?'Loading PostgreSQL...':'Load PostgreSQL Read Model'}
    </button>

    {state.status==='error'&&
      <p role="alert" style={{margin:'8px 0 0'}}>
        PostgreSQL read failed: {state.error?.message||String(state.error)}
      </p>
    }

    {state.status==='ready'&&state.data&&<>
      <p aria-label="PostgreSQL governed row counts" style={{margin:'8px 0'}}>
        Assets: {state.data.health.assets.toLocaleString()} - Buildings: {state.data.health.buildings.toLocaleString()} - Listings: {state.data.health.listings.toLocaleString()}
      </p>
      <details>
        <summary>Asset sample (3)</summary>
        <pre aria-label="PostgreSQL asset sample" style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(state.data.assets,null,2)}</pre>
      </details>
      <details>
        <summary>Building sample (3)</summary>
        <pre aria-label="PostgreSQL building sample" style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(state.data.buildings,null,2)}</pre>
      </details>
      <details>
        <summary>Listing sample (3)</summary>
        <pre aria-label="PostgreSQL listing sample" style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(state.data.listings,null,2)}</pre>
      </details>
    </>}
  </aside>;
}

export default function Explorer3(props){
  return <>
    <Explorer3Base {...props}/>
    <SCIIPPostgresReadPanel/>
  </>;
}
