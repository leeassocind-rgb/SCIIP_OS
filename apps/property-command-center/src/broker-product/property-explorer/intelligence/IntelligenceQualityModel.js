import{buildGovernedPropertyState}from'./GovernedPropertyState.js';

function freeze(value){return Object.freeze(value);}
function clamp(v){return Math.max(0,Math.min(100,Math.round(v)));}
function pct(n,d){return d?Math.round((n/d)*100):0;}

const CONFIDENCE_SCORE={
  HIGH:95,
  MEDIUM:75,
  LOW:50,
  UNRATED:60
};

function known(field){
  const canonical=field?.effectiveCanonicalValue;
  const external=field?.externalValue;
  return (
    canonical!==null&&canonical!==undefined&&canonical!=='' ||
    external!==null&&external!==undefined&&external!==''
  );
}

function fieldConfidence(field){
  const base=CONFIDENCE_SCORE[String(field?.confidence||'UNRATED').toUpperCase()]??60;
  const state=field?.effectiveAgreementState;
  if(state==='AGREED')return clamp(base+5);
  if(state==='REVIEW')return clamp(base-15);
  return clamp(base);
}

function band(score){
  if(score>=85)return'EXCELLENT';
  if(score>=75)return'STRONG';
  if(score>=60)return'DEVELOPING';
  return'LIMITED';
}

function confidenceBand(score){
  if(score>=85)return'HIGH';
  if(score>=70)return'MEDIUM';
  return'LOW';
}

function healthBand(score){
  if(score>=90)return'HEALTHY';
  if(score>=75)return'WATCH';
  return'ATTENTION';
}

export function buildIntelligenceQualityModel(property,model){
  const governed=buildGovernedPropertyState(property,model);
  const fields=governed?.reconciled?.fields||[];
  const total=fields.length;

  const knownFields=fields.filter(known);
  const coveragePct=pct(knownFields.length,total);

  const confidenceScores=knownFields.map(fieldConfidence);
  const confidenceScore=confidenceScores.length
    ? clamp(confidenceScores.reduce((a,b)=>a+b,0)/confidenceScores.length)
    : 0;

  const reviewCount=governed.metrics.review;
  const pendingCount=governed.metrics.pendingGovernance;
  const rolledBack=governed.metrics.rolledBack;
  const rejected=governed.lifecycle?.counts?.rejected||0;
  const deferred=governed.lifecycle?.counts?.deferred||0;

  let governanceHealth=100;
  governanceHealth-=reviewCount*18;
  governanceHealth-=pendingCount*8;
  governanceHealth-=rolledBack*3;
  governanceHealth-=rejected*2;
  governanceHealth-=deferred*2;
  governanceHealth=clamp(governanceHealth);

  const overallScore=clamp(
    coveragePct*0.35+
    confidenceScore*0.40+
    governanceHealth*0.25
  );

  return freeze({
    status:'ACTIVE',
    propertyId:governed.propertyId,
    canonicalAuthority:'SCIIP',
    overall:freeze({
      score:overallScore,
      quality:band(overallScore)
    }),
    coverage:freeze({
      score:coveragePct,
      knownFields:knownFields.length,
      totalFields:total,
      canonicalCompletenessPct:governed.metrics.completenessPct,
      externalCoveragePct:governed.metrics.externalCoveragePct,
      label:band(coveragePct)
    }),
    confidence:freeze({
      score:confidenceScore,
      label:confidenceBand(confidenceScore),
      assessedFields:knownFields.length,
      missingFieldsExcluded:true
    }),
    governance:freeze({
      score:governanceHealth,
      label:healthBand(governanceHealth),
      reviewRequired:reviewCount,
      pendingGovernance:pendingCount,
      rolledBack,
      rejected,
      deferred,
      enrichmentOnlyNotPenalized:true
    }),
    diagnostics:freeze({
      legacyCompositeScore:governed.confidenceScore,
      legacyCompositeClass:governed.confidence,
      governedPropertyState:governed.state,
      methodology:'COVERAGE_35_CONFIDENCE_40_GOVERNANCE_25',
      eventDerived:true
    })
  });
}
