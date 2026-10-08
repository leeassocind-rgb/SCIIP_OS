const norm=value=>String(value??'').trim().toUpperCase().replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const number=value=>{
  const n=Number(value);
  return Number.isFinite(n)?n:null;
};

function getAddress(parcel){
  return parcel?.location?.streetAddress||
    parcel?.address?.streetAddress||
    parcel?.propertyAddress?.streetAddress||
    parcel?.address?.label||
    parcel?.label||
    '';
}
function getCity(parcel){
  return parcel?.location?.locality||parcel?.address?.locality||parcel?.propertyAddress?.city||'';
}
function getPostal(parcel){
  return parcel?.location?.postalCode||parcel?.address?.postalCode||parcel?.propertyAddress?.postalCode||'';
}
function getApn(parcel){
  return parcel?.assessment?.apn||parcel?.apn||parcel?.parcelNumber||parcel?.alternateId||null;
}
function getBoundary(parcel){
  return parcel?.location?.geometry?.wkt||
    parcel?.geometry?.wkt||
    parcel?.boundary?.wkt||
    null;
}
function getLotArea(parcel){
  return number(parcel?.land?.calculatedLotArea)||
    number(parcel?.land?.lotArea)||
    number(parcel?.calculatedLotArea)||
    null;
}

export function scoreParcelCandidate(subject,parcel){
  const reasons=[];
  let score=0;
  const subjectAddress=norm(subject?.address);
  const parcelAddress=norm(getAddress(parcel));
  const subjectCity=norm(subject?.city);
  const parcelCity=norm(getCity(parcel));
  const subjectZip=String(subject?.zip||'').slice(0,5);
  const parcelZip=String(getPostal(parcel)||'').slice(0,5);

  if(subjectAddress&&parcelAddress){
    if(parcelAddress===subjectAddress){score+=55;reasons.push('ADDRESS_EXACT');}
    else{
      const subjectNumber=subjectAddress.split(' ')[0];
      const parcelNumber=parcelAddress.split(' ')[0];
      const subjectStreet=subjectAddress.split(' ').slice(1).join(' ');
      const parcelStreet=parcelAddress.split(' ').slice(1).join(' ');
      if(subjectStreet&&parcelStreet===subjectStreet){score+=28;reasons.push('STREET_EXACT');}
      if(subjectNumber&&parcelNumber===subjectNumber){score+=18;reasons.push('STREET_NUMBER_EXACT');}
    }
  }
  if(subjectCity&&parcelCity&&subjectCity===parcelCity){score+=10;reasons.push('CITY_EXACT');}
  if(subjectZip&&parcelZip&&subjectZip===parcelZip){score+=10;reasons.push('ZIP_EXACT');}

  const subjectAcres=number(subject?.landAcres);
  const lotArea=getLotArea(parcel);
  if(subjectAcres&&lotArea){
    const parcelAcres=lotArea>1000?lotArea/43560:lotArea;
    const delta=Math.abs(parcelAcres-subjectAcres)/subjectAcres;
    if(delta<=.10){score+=10;reasons.push('LAND_AREA_WITHIN_10PCT');}
    else if(delta<=.25){score+=5;reasons.push('LAND_AREA_WITHIN_25PCT');}
  }

  if(getBoundary(parcel)){score+=5;reasons.push('HAS_BOUNDARY');}
  if(getApn(parcel)){score+=5;reasons.push('HAS_APN');}

  return{
    score:Math.min(100,score),
    reasons,
    apn:getApn(parcel),
    address:getAddress(parcel),
    city:getCity(parcel),
    postalCode:getPostal(parcel),
    boundaryWkt:getBoundary(parcel)
  };
}

export function rankParcelCandidates(subject,parcels=[]){
  return parcels.map(parcel=>({parcel,...scoreParcelCandidate(subject,parcel)}))
    .sort((a,b)=>b.score-a.score||String(a.apn||'').localeCompare(String(b.apn||'')));
}

export function resolveParcelCandidate(subject,parcels=[],{
  acceptScore=70,
  reviewScore=45
}={}){
  const ranked=rankParcelCandidates(subject,parcels);
  const top=ranked[0]||null;
  if(!top)return{status:'NO_MATCH',confidence:0,top:null,candidates:[]};
  if(top.score>=acceptScore)return{status:'VERIFIED_MATCH',confidence:top.score,top,candidates:ranked};
  if(top.score>=reviewScore)return{status:'REVIEW_REQUIRED',confidence:top.score,top,candidates:ranked};
  return{status:'NO_MATCH',confidence:top.score,top,candidates:ranked};
}

export function mergeLightBoxParcelEnrichment(subject,resolution){
  if(!subject)return null;
  const base={...subject};
  const audit={
    provider:'LightBox',
    appliedAt:new Date().toISOString(),
    resolutionStatus:resolution?.status||'NO_MATCH',
    confidence:resolution?.confidence||0,
    canonicalIdentityOverwritten:false,
    fieldsApplied:[]
  };
  if(resolution?.status!=='VERIFIED_MATCH'||!resolution?.top){
    return{property:base,audit};
  }
  const top=resolution.top;
  const enrichment={...(base.enrichment||{})};
  enrichment.lightBox={
    provider:'LightBox',
    parcelId:top.parcel?.id||top.parcel?.uuaid||top.parcel?.uaid||null,
    apn:top.apn||null,
    matchScore:top.score,
    matchReasons:top.reasons,
    rawParcel:top.parcel
  };
  audit.fieldsApplied.push('enrichment.lightBox');

  // Never overwrite canonical address/city/zip/coordinates/id.
  // Parcel/APN may only fill a blank canonical field.
  if(!base.parcelId&&top.apn){
    base.parcelId=top.apn;
    audit.fieldsApplied.push('parcelId');
  }
  base.enrichment=enrichment;
  base.provenance={
    ...(base.provenance||{}),
    enrichmentProviders:[
      ...new Set([...(base.provenance?.enrichmentProviders||[]),'LightBox'])
    ]
  };
  return{property:base,audit};
}
