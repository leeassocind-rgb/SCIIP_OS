function number(value){
  const n=Number(value);
  return Number.isFinite(n)?n:null;
}

function firstNumber(...values){
  for(const value of values){
    const n=number(value);
    if(n!==null)return n;
  }
  return null;
}

function percentDelta(a,b){
  const x=number(a),y=number(b);
  if(x===null||y===null||x===0)return null;
  return Math.abs(y-x)/Math.abs(x)*100;
}

function normalizeText(value=''){
  return String(value??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}

function canonicalLandAcres(property){
  return firstNumber(
    property?.landAcres,
    property?.landAreaAcres,
    property?.siteAcres,
    property?.acres,
    property?.land,
    property?.lotAcres,
    property?.site?.acres
  );
}

function canonicalBuildingSf(property){
  return firstNumber(
    property?.buildingSf,
    property?.buildingSF,
    property?.buildingArea,
    property?.squareFeet,
    property?.sf,
    property?.building?.sf
  );
}

function siteAlignment(canonical,external){
  const delta=percentDelta(canonical,external);
  if(delta===null)return Object.freeze({
    status:'INSUFFICIENT_DATA',
    deltaPct:null,
    label:'Comparison unavailable'
  });
  if(delta<=3)return Object.freeze({status:'ALIGNED',deltaPct:delta,label:'Site area aligned'});
  if(delta<=10)return Object.freeze({status:'REVIEW',deltaPct:delta,label:'Minor site-area variance'});
  return Object.freeze({status:'DIVERGENT',deltaPct:delta,label:'Material site-area variance'});
}

function classificationAlignment(property,intel){
  const canonical=normalizeText(
    property?.propertyType||
    property?.assetType||
    property?.buildingType||
    property?.use||
    'industrial'
  );
  const external=normalizeText(
    [
      intel?.propertyType?.typeDescription,
      intel?.propertyType?.classDescription,
      intel?.landUse?.normalizedDescription,
      intel?.landUse?.description
    ].filter(Boolean).join(' ')
  );

  const industrialTerms=['industrial','warehouse','distribution','manufacturing','logistics'];
  const canonicalIndustrial=industrialTerms.some(term=>canonical.includes(term));
  const externalIndustrial=industrialTerms.some(term=>external.includes(term));

  return Object.freeze({
    status:canonicalIndustrial&&externalIndustrial?'ALIGNED':
      externalIndustrial?'SUPPORTIVE':
      external?'REVIEW':'INSUFFICIENT_DATA',
    canonical:canonical||null,
    external:external||null,
    industrialSupport:externalIndustrial
  });
}

function assessmentComposition(intel){
  const total=number(intel?.assessment?.total);
  const land=number(intel?.assessment?.land);
  const improvements=number(intel?.assessment?.improvements);
  const improvementPct=number(intel?.assessment?.improvementPercent);

  return Object.freeze({
    total,
    land,
    improvements,
    improvementPct:improvementPct!==null?improvementPct:
      total&&improvements!==null?improvements/total*100:null,
    landPct:total&&land!==null?land/total*100:null,
    year:intel?.assessment?.year||null
  });
}

function recordedActivity(intel){
  const sale=intel?.lastMarketSale||null;
  const loan=intel?.lastLoan||null;
  const saleValue=number(sale?.value);
  const loanValue=number(loan?.value);
  const loanToSalePct=saleValue&&loanValue!==null?saleValue?loanValue/saleValue*100:null:null;

  return Object.freeze({
    hasSale:Boolean(sale),
    hasLoan:Boolean(loan),
    saleValue,
    saleDate:sale?.transferDate||null,
    buyer:sale?.buyer||null,
    seller:sale?.seller||null,
    loanValue,
    loanDate:loan?.recordingDate||null,
    lender:loan?.lender||null,
    loanToSalePct
  });
}

export function buildVerifiedParcelSynthesis(property,parcelEnrichment){
  if(!parcelEnrichment||parcelEnrichment.status!=='VERIFIED_ENRICHMENT'){
    return Object.freeze({
      status:'WITHHELD',
      reason:'VERIFIED_PARCEL_ENRICHMENT_REQUIRED',
      authoritative:false
    });
  }

  const sciipLandAcres=canonicalLandAcres(property);
  const externalLandAcres=number(parcelEnrichment?.site?.calculatedLotAreaAcres);
  const area=siteAlignment(sciipLandAcres,externalLandAcres);
  const classification=classificationAlignment(property,parcelEnrichment);
  const assessment=assessmentComposition(parcelEnrichment);
  const activity=recordedActivity(parcelEnrichment);
  const buildingSf=canonicalBuildingSf(property);

  const signals=[];
  if(area.status==='ALIGNED'){
    signals.push(Object.freeze({
      id:'SITE_AREA_ALIGNED',
      severity:'INFO',
      title:'Site area independently corroborated',
      detail:`SCIIP ${sciipLandAcres?.toFixed?.(2)??'—'} ac · LightBox ${externalLandAcres?.toFixed?.(2)??'—'} ac`
    }));
  }else if(area.status==='REVIEW'||area.status==='DIVERGENT'){
    signals.push(Object.freeze({
      id:'SITE_AREA_VARIANCE',
      severity:area.status==='DIVERGENT'?'WARNING':'REVIEW',
      title:'Site area requires review',
      detail:`SCIIP ${sciipLandAcres?.toFixed?.(2)??'—'} ac · LightBox ${externalLandAcres?.toFixed?.(2)??'—'} ac`
    }));
  }

  if(classification.industrialSupport){
    signals.push(Object.freeze({
      id:'INDUSTRIAL_CLASSIFICATION_SUPPORTED',
      severity:'INFO',
      title:'Industrial classification supported',
      detail:parcelEnrichment?.landUse?.normalizedDescription||
        parcelEnrichment?.propertyType?.typeDescription||
        'Industrial'
    }));
  }else if(classification.status==='REVIEW'){
    signals.push(Object.freeze({
      id:'CLASSIFICATION_REVIEW',
      severity:'REVIEW',
      title:'External classification differs',
      detail:classification.external||'External classification unavailable'
    }));
  }

  if(assessment.improvementPct!==null){
    signals.push(Object.freeze({
      id:'ASSESSMENT_COMPOSITION',
      severity:'INFO',
      title:'Assessment composition available',
      detail:`${assessment.improvementPct.toFixed(1)}% improvements · ${assessment.year||'year unavailable'}`
    }));
  }

  if(activity.hasLoan){
    signals.push(Object.freeze({
      id:'RECORDED_FINANCING',
      severity:'INFO',
      title:'Recorded financing detected',
      detail:`${activity.lender||'Lender unavailable'} · ${activity.loanDate?.slice?.(0,10)||'date unavailable'}`
    }));
  }

  if(activity.hasSale){
    signals.push(Object.freeze({
      id:'RECORDED_SALE',
      severity:'INFO',
      title:'Recorded sale evidence available',
      detail:`${activity.buyer||'Buyer unavailable'} · ${activity.saleDate?.slice?.(0,10)||'date unavailable'}`
    }));
  }

  const reviewCount=signals.filter(signal=>signal.severity==='REVIEW'||signal.severity==='WARNING').length;

  return Object.freeze({
    status:'ACTIVE',
    authoritative:false,
    canonicalAuthority:'SCIIP',
    provider:'LightBox',
    silentOverwrite:false,
    site:Object.freeze({
      sciipLandAcres,
      externalLandAcres,
      alignmentStatus:area.status,
      deltaPct:area.deltaPct,
      buildingSf
    }),
    classification,
    assessment,
    activity,
    signals:Object.freeze(signals),
    reviewCount,
    posture:reviewCount===0?'CORROBORATED':'REVIEW_REQUIRED'
  });
}

export function formatSynthesisMoney(value){
  const n=number(value);
  if(n===null)return'—';
  return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
}

export function formatSynthesisPercent(value,digits=1){
  const n=number(value);
  return n===null?'—':`${n.toFixed(digits)}%`;
}
