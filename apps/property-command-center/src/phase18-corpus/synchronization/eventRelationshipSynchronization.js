const freeze=v=>Object.freeze(v);

export function synchronizeEventsAndRelationships({events=[],relationships=[],canonicalIds=[]}={}) {
  const validIds=new Set(canonicalIds);
  const eventRows=events.map(event=>{
    const linked=validIds.has(event.canonicalId);
    return freeze({...event,linked,status:linked?'SYNCHRONIZED':'UNRESOLVED_IDENTITY'});
  });
  const relationshipRows=relationships.map(rel=>{
    const fromValid=validIds.has(rel.fromCanonicalId);
    const toValid=validIds.has(rel.toCanonicalId);
    const synchronized=fromValid&&toValid;
    return freeze({...rel,fromValid,toValid,synchronized,status:synchronized?'SYNCHRONIZED':'UNRESOLVED_IDENTITY'});
  });

  return freeze({
    events:freeze(eventRows),
    relationships:freeze(relationshipRows),
    eventsSynchronized:eventRows.filter(e=>e.linked).length,
    relationshipsSynchronized:relationshipRows.filter(r=>r.synchronized).length,
    unresolved:eventRows.filter(e=>!e.linked).length+relationshipRows.filter(r=>!r.synchronized).length,
    eventHistoryPreserved:true,
    relationshipHistoryPreserved:true,
    autonomousRepairAllowed:false
  });
}
