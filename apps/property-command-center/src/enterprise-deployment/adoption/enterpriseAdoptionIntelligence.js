const freeze=v=>Object.freeze(v);

export function evaluateEnterpriseAdoption({users=[],sessions=[],workspaces=[]}={}) {
  const activeUserIds=new Set(sessions.map(s=>s.userId));
  const activeUsers=users.filter(u=>activeUserIds.has(u.userId)).length;
  const adoptionPct=users.length?Number((activeUsers/users.length*100).toFixed(2)):0;
  const workspaceUsage=workspaces.map(workspace=>{
    const count=sessions.filter(s=>s.workspaceId===workspace.workspaceId).length;
    return freeze({...workspace,sessionCount:count,status:count?'ADOPTED':'UNUSED'});
  });
  return freeze({
    users:users.length,
    activeUsers,
    adoptionPct,
    workspaceUsage:freeze(workspaceUsage),
    adoptedWorkspaces:workspaceUsage.filter(w=>w.status==='ADOPTED').length,
    privacyPreserved:true,
    userScoringAllowed:false,
    autonomousBehaviorModificationAllowed:false
  });
}
