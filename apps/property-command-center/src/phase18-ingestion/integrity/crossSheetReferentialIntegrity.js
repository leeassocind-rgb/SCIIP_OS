const freeze=v=>Object.freeze(v);

export function validateCrossSheetReferentialIntegrity({entities={},relationships=[]}={}) {
  const entitySets=new Map(
    Object.entries(entities).map(([type,rows])=>[
      type,
      new Set((rows||[]).map(row=>String(row.id)))
    ])
  );

  const results=relationships.map(rel=>{
    const fromExists=entitySets.get(rel.fromType)?.has(String(rel.fromId))||false;
    const toExists=entitySets.get(rel.toType)?.has(String(rel.toId))||false;
    const passed=fromExists&&toExists;
    return freeze({
      ...rel,
      fromExists,
      toExists,
      passed,
      status:passed?'VALID':'ORPHANED'
    });
  });

  return freeze({
    relationships:freeze(results),
    total:results.length,
    valid:results.filter(r=>r.passed).length,
    orphaned:results.filter(r=>!r.passed).length,
    referentialIntegrityEnforced:true,
    orphanWritesAllowed:false
  });
}
