const freeze = value => Object.freeze(value);

export function evaluateCapacity({teams=[],assignments=[]}={}) {
  const assignmentLoad = assignments.reduce((map,item) => {
    map[item.teamId] = (map[item.teamId] || 0) + Number(item.requiredHours || 0);
    return map;
  }, {});

  const rows = teams.map(team => {
    const capacity = Number(team.capacityHours || 0);
    const load = Number(assignmentLoad[team.teamId] || 0);
    const utilizationPct = capacity ? Number((load / capacity * 100).toFixed(2)) : 0;
    return freeze({
      teamId: team.teamId,
      capacityHours: capacity,
      requiredHours: load,
      utilizationPct,
      status: utilizationPct > 100 ? 'OVER_CAPACITY' : utilizationPct >= 85 ? 'TIGHT' : 'AVAILABLE'
    });
  });

  return freeze({
    teams: freeze(rows),
    totalTeams: rows.length,
    overCapacity: rows.filter(item=>item.status==='OVER_CAPACITY').length,
    capacityVisible: true,
    executiveApprovalRequired: true,
    autonomousStaffingAllowed: false
  });
}
