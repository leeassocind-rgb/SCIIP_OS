import{evidenceRecord}from'./EnrichmentEvidence.mjs';

function first(...values){return values.find(value=>value!==undefined&&value!==null&&value!=='')??null;}

export function extractParcelEvidence(parcel,{contractId='parcels.geometry',matchScore=null}={}){
  if(!parcel)return[];
  const location=parcel.location||{};
  const assessment=parcel.assessment||{};
  const land=parcel.land||{};
  const owner=parcel.owner||{};
  const evidence=[];
  const add=(field,value)=>{
    if(value===undefined||value===null||value==='')return;
    evidence.push(evidenceRecord({
      field,value,
      sourceType:'LIGHTBOX_VERIFIED',
      sourceId:parcel.id||parcel.uuaid||parcel.uaid||null,
      provider:'LightBox',
      confidence:matchScore,
      contractId,
      status:'ENRICHMENT'
    }));
  };

  add('parcelId', first(assessment.apn,parcel.apn,parcel.parcelNumber,parcel.alternateId));
  add('address', first(location.streetAddress,parcel.address?.streetAddress,parcel.label));
  add('city', first(location.locality,parcel.address?.locality));
  add('zip', first(location.postalCode,parcel.address?.postalCode));
  add('landAcres', first(land.calculatedLotArea,land.lotArea,parcel.calculatedLotArea));
  add('owner', first(owner.name,owner.companyName,parcel.ownerName));
  add('zoning', first(parcel.zoning?.code,parcel.zoningCode));
  add('propertyType', first(parcel.propertyType?.description,parcel.propertyType,parcel.landUse?.description));
  return evidence;
}
