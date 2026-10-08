const freeze=value=>Object.freeze(value);

export const DIRECTIONS=freeze(['NORTH','EAST','SOUTH','WEST']);


function normalizeDirection(value,bearing){
  const direction=String(value||'').toUpperCase();
  if(DIRECTIONS.includes(direction))return direction;
  const numeric=Number(bearing);
  if(Number.isFinite(numeric))return directionFromBearing(numeric);
  if(direction.includes('NORTH'))return 'NORTH';
  if(direction.includes('EAST'))return 'EAST';
  if(direction.includes('SOUTH'))return 'SOUTH';
  if(direction.includes('WEST'))return 'WEST';
  return 'NORTH';
}

export function buildImmediateNeighbors({
  subject,
  properties=[],
  parcelRelationships=[],
  maxDistanceMiles=2
}={}){
  if(!subject)throw new Error('subject is required');

  const adjoining=parcelRelationships
    .filter(item=>item.subjectPropertyId===subject.id)
    .map(item=>{
      const property=properties.find(candidate=>candidate.id===item.neighborPropertyId);
      if(!property)return null;
      return freeze({
        property,
        direction:normalizeDirection(item.direction,item.bearingDegrees??bearingDegrees(subject,property)),
        relationshipType:'ADJOINING',
        distanceMiles:Number(item.distanceMiles||0),
        distanceFeet:Number(item.distanceFeet||0),
        sharedBoundaryFeet:Number(item.sharedBoundaryFeet||0),
        bearingDegrees:Number(item.bearingDegrees??bearingDegrees(subject,property)),
        confidence:item.confidence||'HIGH',
        evidenceIds:freeze(item.evidenceIds||[])
      });
    })
    .filter(Boolean);

  const usedIds=new Set(adjoining.map(row=>row.property.id));
  const directional=Object.fromEntries(DIRECTIONS.map(direction=>[direction,[]]));

  for(const row of adjoining)directional[row.direction].push(row);

  for(const property of properties){
    if(property.id===subject.id||usedIds.has(property.id))continue;
    const distance=haversineMiles(subject,property);
    if(!Number.isFinite(distance)||distance>maxDistanceMiles)continue;

    const bearing=bearingDegrees(subject,property);
    const direction=directionFromBearing(bearing);

    directional[direction].push(freeze({
      property,
      direction,
      relationshipType:'NEAREST_DIRECTIONAL',
      distanceMiles:distance,
      distanceFeet:Math.round(distance*5280),
      sharedBoundaryFeet:0,
      bearingDegrees:bearing,
      confidence:property.lat!=null&&property.lng!=null?'MEDIUM':'LOW',
      evidenceIds:freeze(property.sourceEvidenceIds||[])
    }));
  }

  for(const direction of DIRECTIONS){
    directional[direction]=freeze(
      directional[direction].sort((a,b)=>{
        if(a.relationshipType!==b.relationshipType){
          return a.relationshipType==='ADJOINING'?-1:1;
        }
        return a.distanceMiles-b.distanceMiles;
      })
    );
  }

  const primary=Object.fromEntries(
    DIRECTIONS.map(direction=>[direction,directional[direction][0]||null])
  );

  const relationships=freeze(
    DIRECTIONS.flatMap(direction=>
      directional[direction].map(row=>freeze({
        subjectPropertyId:subject.id,
        neighborPropertyId:row.property.id,
        direction,
        relationshipType:row.relationshipType,
        distanceFeet:row.distanceFeet,
        sharedBoundaryFeet:row.sharedBoundaryFeet,
        bearingDegrees:Math.round(row.bearingDegrees),
        confidence:row.confidence,
        evidenceIds:row.evidenceIds
      }))
    )
  );

  return freeze({
    subjectPropertyId:subject.id,
    directions:freeze({
      NORTH:directional.NORTH,
      EAST:directional.EAST,
      SOUTH:directional.SOUTH,
      WEST:directional.WEST
    }),
    primary:freeze(primary),
    relationships,
    summary:buildNeighborSummary(subject,directional)
  });
}

export function buildNeighborIntelligence({subject,neighbors}={}){
  if(!subject||!neighbors)throw new Error('subject and neighbors are required');

  const signals=[];

  for(const direction of DIRECTIONS){
    for(const row of neighbors.directions[direction]){
      const property=row.property;

      if(property.owner&&subject.owner&&property.owner===subject.owner){
        signals.push(signal(
          'COMMON_OWNERSHIP',
          direction,
          property,
          'Potential coordinated leasing, expansion, or assemblage opportunity.'
        ));
      }

      if(['AVAILABLE','VACANT','UNDER CONSTRUCTION'].includes(property.status)){
        signals.push(signal(
          'AVAILABILITY',
          direction,
          property,
          'Immediate neighbor availability may affect competition or expansion strategy.'
        ));
      }

      if(property.landAcres&&Number(property.buildingSf||0)===0){
        signals.push(signal(
          'ADJACENT_LAND',
          direction,
          property,
          `${property.landAcres} acres of nearby land may support expansion or assemblage analysis.`
        ));
      }

      if(property.leaseExpirationMonths!=null&&property.leaseExpirationMonths<=24){
        signals.push(signal(
          'LEASE_EXPIRATION',
          direction,
          property,
          `Lease expiration is within ${property.leaseExpirationMonths} months.`
        ));
      }

      if(row.relationshipType==='ADJOINING'&&row.sharedBoundaryFeet>0){
        signals.push(signal(
          'SHARED_BOUNDARY',
          direction,
          property,
          `${row.sharedBoundaryFeet.toLocaleString()} feet of shared boundary.`
        ));
      }
    }
  }

  const ordered=signals.sort((a,b)=>signalPriority(a.type)-signalPriority(b.type));

  return freeze({
    subjectPropertyId:subject.id,
    signals:freeze(ordered),
    summary:ordered.length
      ?ordered.slice(0,3).map(item=>item.message).join(' ')
      :'No material immediate-neighbor signals were identified.'
  });
}

export function directionFromBearing(value){
  const bearing=((Number(value)%360)+360)%360;
  if(bearing>=315||bearing<45)return 'NORTH';
  if(bearing>=45&&bearing<135)return 'EAST';
  if(bearing>=135&&bearing<225)return 'SOUTH';
  return 'WEST';
}

export function bearingDegrees(a,b){
  if(a.lat==null||a.lng==null||b.lat==null||b.lng==null)return 0;
  const toRadians=value=>value*Math.PI/180;
  const toDegrees=value=>value*180/Math.PI;
  const lat1=toRadians(a.lat);
  const lat2=toRadians(b.lat);
  const dLng=toRadians(b.lng-a.lng);
  const y=Math.sin(dLng)*Math.cos(lat2);
  const x=
    Math.cos(lat1)*Math.sin(lat2)-
    Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLng);
  return (toDegrees(Math.atan2(y,x))+360)%360;
}

export function haversineMiles(a,b){
  if(a.lat==null||a.lng==null||b.lat==null||b.lng==null)return Infinity;
  const earthRadius=3958.8;
  const toRadians=value=>value*Math.PI/180;
  const dLat=toRadians(b.lat-a.lat);
  const dLng=toRadians(b.lng-a.lng);
  const lat1=toRadians(a.lat);
  const lat2=toRadians(b.lat);
  const h=
    Math.sin(dLat/2)**2+
    Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2*earthRadius*Math.asin(Math.sqrt(h));
}

function buildNeighborSummary(subject,directional){
  const populated=Object.values(directional).filter(rows=>rows.length).length;
  const adjoining=DIRECTIONS.flatMap(direction=>directional[direction])
    .filter(row=>row.relationshipType==='ADJOINING').length;

  return `${subject.address||subject.name} has ${adjoining} governed adjoining parcel relationship${adjoining===1?'':'s'} and ${populated} populated directional sector${populated===1?'':'s'}.`;
}

function signal(type,direction,property,message){
  return freeze({
    id:`${type}-${direction}-${property.id}`,
    type,
    direction,
    propertyId:property.id,
    propertyAddress:property.address||property.name,
    message
  });
}

function signalPriority(type){
  const priorities={
    SHARED_BOUNDARY:1,
    COMMON_OWNERSHIP:2,
    ADJACENT_LAND:3,
    AVAILABILITY:4,
    LEASE_EXPIRATION:5
  };
  return priorities[type]||99;
}
