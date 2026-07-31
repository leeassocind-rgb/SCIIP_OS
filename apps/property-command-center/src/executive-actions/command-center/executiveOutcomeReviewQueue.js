export function buildExecutiveOutcomeReviewQueue(viewModels = []) {
  const rows = viewModels.filter(v => v?.requiresReview).slice().sort((a,b) => String(b.completedAt||'').localeCompare(String(a.completedAt||'')));
  return Object.freeze(rows.map((row,index)=>Object.freeze({...row,reviewRank:index+1,reviewStatus:'PENDING_HUMAN_REVIEW'})));
}
