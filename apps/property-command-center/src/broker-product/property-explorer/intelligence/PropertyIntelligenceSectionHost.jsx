import React from'react';
import LightBoxParcelPanel from'../integrations/lightbox/LightBoxParcelPanel.jsx';
import LightBoxReadinessPanel from'../integrations/lightbox/LightBoxReadinessPanel.jsx';
import LightBoxSourceComparison from'../integrations/lightbox/LightBoxSourceComparison.jsx';

const Detail=({label,value})=><div className="explorer3__detail"><span>{label}</span><strong>{value??'—'}</strong></div>;
const Grid=({children})=><div className="explorer3__detail-grid">{children}</div>;

export default function PropertyIntelligenceSectionHost({sectionId,property,snapshot,spatialIdentity,lightBoxParcel,lightBoxReadiness,neighbors}){
  if(sectionId==='snapshot')return <div className="explorer3__pi-section">
    <div className="explorer3__hero-signal"><div><strong>{snapshot.provenanceStatus==='VERIFIED'?'Verified Property Record':'Source Review Required'}</strong><p>{snapshot.address} · {snapshot.location||'Location unavailable'}</p></div></div>
    <Grid><Detail label="Status" value={snapshot.status}/><Detail label="Record Type" value={snapshot.recordType}/><Detail label="Provenance" value={snapshot.provenanceStatus}/><Detail label="Conflicts" value={snapshot.conflictCount||'None'}/></Grid>
  </div>;

  if(sectionId==='building')return <div className="explorer3__pi-section"><Grid>
    <Detail label="Building SF" value={property.buildingSf}/><Detail label="Land Area" value={property.landAcres?`${property.landAcres} AC`:'—'}/>
    <Detail label="Clear Height" value={property.clearHeightFt?`${property.clearHeightFt}'`:'—'}/><Detail label="Power" value={property.powerAmps?`${property.powerAmps} A`:'—'}/>
    <Detail label="Dock High" value={property.dockHighDoors}/><Detail label="Grade Level" value={property.gradeLevelDoors}/>
    <Detail label="Trailer Parking" value={property.trailerParking}/><Detail label="Truck Court" value={property.truckCourtFt?`${property.truckCourtFt}'`:'—'}/>
    <Detail label="Sprinkler" value={property.sprinkler}/><Detail label="Year Built" value={property.yearBuilt}/>
  </Grid></div>;

  if(sectionId==='availability')return <div className="explorer3__pi-section"><Grid>
    <Detail label="Available SF" value={property.availableSf}/><Detail label="Asking Rate" value={property.askingRate}/><Detail label="Comp Rate" value={property.compRate}/>
    <Detail label="Availability" value={property.availability||property.status}/><Detail label="Term" value={property.term}/><Detail label="Divisible To" value={property.divisibleTo}/>
  </Grid></div>;

  if(sectionId==='ownership')return <div className="explorer3__pi-section"><Grid>
    <Detail label="Owner" value={property.owner}/><Detail label="Tenant" value={property.tenant}/><Detail label="Ownership Source" value={property.provenance?.sourceType}/><Detail label="Source File" value={property.provenance?.sourceFiles?.[0]?.file}/>
  </Grid></div>;

  if(sectionId==='parcel')return <div className="explorer3__pi-section">
    <Grid><Detail label="Parcel / APN" value={spatialIdentity?.apn}/><Detail label="Boundary" value={spatialIdentity?.hasBoundary?'Verified polygon':'Point only'}/><Detail label="Spatial Source" value={spatialIdentity?.source}/><Detail label="Identity Status" value={spatialIdentity?.verified?'VERIFIED':'REVIEW'}/></Grid>
    <LightBoxParcelPanel state={lightBoxParcel}/><LightBoxReadinessPanel state={lightBoxReadiness}/>
  </div>;

  if(sectionId==='zoning')return <div className="explorer3__pi-section"><Grid>
    <Detail label="Zoning" value={property.zoning}/><Detail label="Status" value={lightBoxReadiness?.readiness?.activeContracts?.includes('zoning')?'Live enrichment ready':'Canonical record'}/>
  </Grid></div>;

  if(sectionId==='neighbors')return <div className="explorer3__pi-section"><Grid>
    <Detail label="Adjacent" value={neighbors?.rows?.filter(row=>row.relationshipType==='ADJOINING').length||0}/><Detail label="Nearby" value={neighbors?.rows?.filter(row=>row.relationshipType==='NEARBY').length||0}/><Detail label="Spatial Method" value="Boundary aware"/><Detail label="Radius" value="1 mile"/>
  </Grid></div>;

  if(sectionId==='evidence')return <div className="explorer3__pi-section">
    <Grid><Detail label="Canonical Source" value={property.provenance?.sourceType}/><Detail label="Verification" value={snapshot.provenanceStatus}/><Detail label="External Provider" value="LightBox"/><Detail label="Merge Policy" value="Enrich · never overwrite"/></Grid>
    <LightBoxSourceComparison state={lightBoxParcel}/>
  </div>;

  const names={assessment:'Assessment',structure:'Structure',transactions:'Transactions',infrastructure:'Infrastructure',risk:'Risk'};
  return <div className="explorer3__pi-section explorer3__pi-section--placeholder">
    <strong>{names[sectionId]||'Intelligence'} enrichment</strong>
    <p>This section activates automatically when its LightBox contract is ACTIVE_VERIFIED.</p>
    <LightBoxReadinessPanel state={lightBoxReadiness}/>
  </div>;
}
