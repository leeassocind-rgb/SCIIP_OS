const PREFIX = 'sciip.assignment.workspace.v1';
export const DEFAULT_WORKSPACE_STATE = Object.freeze({
  selectedTab: 'Executive Summary', scrollPosition: 0, filters: {}, notes: '', expandedSections: []
});

export function createWorkspaceMemory(storage) {
  const target = storage || (typeof window !== 'undefined' ? window.localStorage : null);
  const key = id => `${PREFIX}.${id}`;
  return {
    load(id) {
      if (!target) return {...DEFAULT_WORKSPACE_STATE};
      try { return {...DEFAULT_WORKSPACE_STATE, ...JSON.parse(target.getItem(key(id)) || '{}')}; }
      catch { return {...DEFAULT_WORKSPACE_STATE}; }
    },
    save(id, patch) {
      const next = {...this.load(id), ...patch, updatedAt: new Date().toISOString()};
      if (target) target.setItem(key(id), JSON.stringify(next));
      return next;
    },
    clear(id) { if (target) target.removeItem(key(id)); }
  };
}
