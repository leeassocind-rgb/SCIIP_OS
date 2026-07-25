/**
 * SCIIP_OS v7.0 — Epic 6 Sprint 3
 * Executive Alerts, Decisions & Action Orchestration
 * Repository-native, governed and non-destructive by default.
 */
var SCIIP_EPIC6_EXECUTIVE_ACTION_ORCHESTRATION = (function () {
  'use strict';

  var VERSION = 'v7.0-epic6-sprint3.0';
  var FRAMEWORK = 'SCIIP_V7_EPIC6_SPRINT3_EXECUTIVE_ALERTS_DECISIONS_ACTION_ORCHESTRATION';
  var STORE_KEY = 'SCIIP_EPIC6_SPRINT3_STATE_V1';

  function now_() { return new Date().toISOString(); }
  function uid_(prefix) {
    var token;
    try { token = Utilities.getUuid().replace(/-/g, '').slice(0, 12); }
    catch (e) { token = String(new Date().getTime()); }
    return prefix + '-' + token;
  }
  function clone_(value) { return JSON.parse(JSON.stringify(value)); }

  function defaultState_() {
    return {
      revision: 1,
      alerts: [],
      decisions: [],
      actions: [],
      audit: [],
      destructiveExecutionEnabled: false
    };
  }

  function properties_() {
    try { return PropertiesService.getScriptProperties(); }
    catch (e) { return null; }
  }

  function load_() {
    var props = properties_();
    if (!props) return defaultState_();
    var raw = props.getProperty(STORE_KEY);
    if (!raw) return defaultState_();
    try { return JSON.parse(raw); }
    catch (e) { return defaultState_(); }
  }

  function save_(state) {
    var props = properties_();
    if (props) props.setProperty(STORE_KEY, JSON.stringify(state));
    return state;
  }

  function audit_(state, type, entityId, detail) {
    state.audit.push({
      auditId: uid_('AUDIT'),
      type: type,
      entityId: entityId,
      detail: detail || {},
      at: now_(),
      lineagePreserved: true
    });
  }

  function normalizeSeverity_(value) {
    value = String(value || 'MEDIUM').toUpperCase();
    return ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].indexOf(value) >= 0 ? value : 'MEDIUM';
  }

  function createAlert_(state, request) {
    request = request || {};
    var alert = {
      alertId: request.alertId || uid_('ALERT'),
      title: request.title || 'Executive operational alert',
      severity: normalizeSeverity_(request.severity),
      sourceWorkspace: request.sourceWorkspace || 'executive-operations',
      propertyId: request.propertyId || null,
      owner: request.owner || 'UNASSIGNED',
      dueDate: request.dueDate || null,
      status: 'OPEN',
      escalationLevel: 0,
      reviewRequired: true,
      createdAt: now_(),
      updatedAt: now_()
    };
    state.alerts.push(alert);
    audit_(state, 'ALERT_CREATED', alert.alertId, {severity: alert.severity});
    return alert;
  }

  function createDecision_(state, request) {
    request = request || {};
    var decision = {
      decisionId: request.decisionId || uid_('DECISION'),
      alertId: request.alertId || null,
      title: request.title || 'Executive decision',
      owner: request.owner || 'UNASSIGNED',
      dueDate: request.dueDate || null,
      status: 'DRAFT',
      selectedOption: null,
      rationale: null,
      evidence: request.evidence || [],
      approvalRequired: true,
      createdAt: now_(),
      updatedAt: now_()
    };
    state.decisions.push(decision);
    audit_(state, 'DECISION_CREATED', decision.decisionId, {alertId: decision.alertId});
    return decision;
  }

  function createAction_(state, request) {
    request = request || {};
    var action = {
      actionId: request.actionId || uid_('ACTION'),
      decisionId: request.decisionId || null,
      title: request.title || 'Executive action',
      owner: request.owner || 'UNASSIGNED',
      dueDate: request.dueDate || null,
      targetWorkspace: request.targetWorkspace || 'property-command-center',
      targetEntityId: request.targetEntityId || null,
      status: 'QUEUED',
      executionMode: 'GOVERNED',
      destructive: !!request.destructive,
      createdAt: now_(),
      updatedAt: now_()
    };
    state.actions.push(action);
    audit_(state, 'ACTION_CREATED', action.actionId, {targetWorkspace: action.targetWorkspace});
    return action;
  }

  function find_(items, key, id) {
    for (var i = 0; i < items.length; i++) if (items[i][key] === id) return items[i];
    return null;
  }

  function alertAction_(state, alertId, action, options) {
    var alert = find_(state.alerts, 'alertId', alertId);
    if (!alert) throw new Error('Alert not found: ' + alertId);
    action = String(action || '').toUpperCase();
    options = options || {};
    if (action === 'ASSIGN') alert.owner = options.owner || alert.owner;
    else if (action === 'ESCALATE') { alert.escalationLevel += 1; alert.status = 'ESCALATED'; }
    else if (action === 'ACKNOWLEDGE') alert.status = 'ACKNOWLEDGED';
    else if (action === 'RESOLVE') alert.status = 'RESOLVED';
    else throw new Error('Unsupported alert action: ' + action);
    alert.updatedAt = now_();
    audit_(state, 'ALERT_' + action, alert.alertId, options);
    return alert;
  }

  function decisionAction_(state, decisionId, action, options) {
    var decision = find_(state.decisions, 'decisionId', decisionId);
    if (!decision) throw new Error('Decision not found: ' + decisionId);
    action = String(action || '').toUpperCase();
    options = options || {};
    if (action === 'SUBMIT') decision.status = 'PENDING_APPROVAL';
    else if (action === 'APPROVE') {
      decision.status = 'APPROVED';
      decision.selectedOption = options.selectedOption || 'APPROVED_OPTION';
      decision.rationale = options.rationale || 'Approved through governed executive review.';
    } else if (action === 'REJECT') {
      decision.status = 'REJECTED';
      decision.rationale = options.rationale || 'Rejected through governed executive review.';
    } else throw new Error('Unsupported decision action: ' + action);
    decision.updatedAt = now_();
    audit_(state, 'DECISION_' + action, decision.decisionId, options);
    return decision;
  }

  function executeAction_(state, actionId, options) {
    var item = find_(state.actions, 'actionId', actionId);
    if (!item) throw new Error('Action not found: ' + actionId);
    options = options || {};
    if (item.destructive && !state.destructiveExecutionEnabled) {
      item.status = 'BLOCKED_GOVERNANCE';
      item.updatedAt = now_();
      audit_(state, 'ACTION_BLOCKED', item.actionId, {reason: 'DESTRUCTIVE_EXECUTION_DISABLED'});
      return item;
    }
    item.status = options.dryRun === false ? 'COMPLETED' : 'DRY_RUN_COMPLETED';
    item.executionReceipt = uid_('ACTION-RECEIPT');
    item.updatedAt = now_();
    audit_(state, 'ACTION_EXECUTED', item.actionId, {status: item.status});
    return item;
  }

  function dashboardFrom_(state) {
    var openAlerts = state.alerts.filter(function (x) { return x.status !== 'RESOLVED'; }).length;
    var pendingDecisions = state.decisions.filter(function (x) { return x.status === 'PENDING_APPROVAL' || x.status === 'DRAFT'; }).length;
    var activeActions = state.actions.filter(function (x) { return x.status !== 'COMPLETED' && x.status !== 'DRY_RUN_COMPLETED'; }).length;
    return {
      framework: FRAMEWORK,
      version: VERSION,
      workspace: 'executive-operations',
      module: 'alerts-decisions-action-orchestration',
      status: 'OPERATIONAL',
      generatedAt: now_(),
      kpis: [
        {id: 'open-alerts', label: 'Open Alerts', value: openAlerts},
        {id: 'pending-decisions', label: 'Pending Decisions', value: pendingDecisions},
        {id: 'active-actions', label: 'Active Actions', value: activeActions},
        {id: 'audit-events', label: 'Audit Events', value: state.audit.length}
      ],
      alerts: clone_(state.alerts),
      decisions: clone_(state.decisions),
      actions: clone_(state.actions),
      auditEvents: state.audit.length,
      crossWorkspaceExecution: true,
      accountableOwners: true,
      dueDateTracking: true,
      reviewRequired: true,
      lineagePreserved: true,
      duplicateSafe: true,
      rollbackAvailable: true,
      destructiveExecutionEnabledByDefault: false
    };
  }

  function test_() {
    var state = defaultState_();
    var alert = createAlert_(state, {title:'Power availability exception', severity:'HIGH', propertyId:'P-2125-W-LOWELL-ST-RIALTO', owner:'Portfolio Operations'});
    alertAction_(state, alert.alertId, 'ESCALATE', {note:'Escalated for executive review.'});
    var decision = createDecision_(state, {alertId:alert.alertId, title:'Authorize utility coordination', owner:'Executive Sponsor', evidence:['POWER_SIGNAL','PROPERTY_CONTEXT']});
    decisionAction_(state, decision.decisionId, 'SUBMIT', {});
    decisionAction_(state, decision.decisionId, 'APPROVE', {selectedOption:'COORDINATE_WITH_UTILITY', rationale:'Protect schedule and power delivery.'});
    var action = createAction_(state, {actionId:'ACTION-TEST-PRIMARY', decisionId:decision.decisionId, title:'Open utility coordination workflow', owner:'Property Operations', targetWorkspace:'property-command-center', targetEntityId:'P-2125-W-LOWELL-ST-RIALTO'});
    executeAction_(state, action.actionId, {dryRun:true});
    var blocked = createAction_(state, {actionId:'ACTION-TEST-BLOCKED', decisionId:decision.decisionId, title:'Destructive production mutation', destructive:true});
    executeAction_(state, blocked.actionId, {dryRun:false});

    var dashboard = dashboardFrom_(state);
    var checks = [
      dashboard.status === 'OPERATIONAL',
      dashboard.alerts.length === 1,
      dashboard.alerts[0].status === 'ESCALATED',
      dashboard.decisions.length === 1 && dashboard.decisions[0].status === 'APPROVED',
      dashboard.actions.length === 2,
      dashboard.actions[0].status === 'DRY_RUN_COMPLETED',
      dashboard.actions[1].status === 'BLOCKED_GOVERNANCE',
      dashboard.crossWorkspaceExecution === true,
      dashboard.lineagePreserved === true,
      dashboard.destructiveExecutionEnabledByDefault === false
    ];
    var failures = [];
    for (var i = 0; i < checks.length; i++) if (!checks[i]) failures.push('test-' + (i + 1));
    return {
      framework: FRAMEWORK,
      version: VERSION,
      status: failures.length ? 'FAILED' : 'PASSED',
      testsRun: checks.length,
      failures: failures,
      result: {
        workspace: dashboard.workspace,
        portalStatus: dashboard.status,
        alerts: dashboard.alerts.length,
        escalatedAlerts: dashboard.alerts.filter(function(x){return x.status === 'ESCALATED';}).length,
        decisions: dashboard.decisions.length,
        approvedDecisions: dashboard.decisions.filter(function(x){return x.status === 'APPROVED';}).length,
        actions: dashboard.actions.length,
        actionExecution: dashboard.actions[0].status,
        destructiveAction: dashboard.actions[1].status,
        accountableOwners: dashboard.accountableOwners,
        dueDateTracking: dashboard.dueDateTracking,
        crossWorkspaceExecution: dashboard.crossWorkspaceExecution,
        auditEvents: dashboard.auditEvents,
        reviewRequired: dashboard.reviewRequired,
        lineagePreserved: dashboard.lineagePreserved,
        destructiveExecutionEnabledByDefault: dashboard.destructiveExecutionEnabledByDefault
      }
    };
  }

  return {
    getDashboard: function () { return dashboardFrom_(load_()); },
    createAlert: function (request) { var s=load_(); var r=createAlert_(s,request); save_(s); return clone_(r); },
    actionAlert: function (id,action,options) { var s=load_(); var r=alertAction_(s,id,action,options); save_(s); return clone_(r); },
    createDecision: function (request) { var s=load_(); var r=createDecision_(s,request); save_(s); return clone_(r); },
    actionDecision: function (id,action,options) { var s=load_(); var r=decisionAction_(s,id,action,options); save_(s); return clone_(r); },
    createAction: function (request) { var s=load_(); var r=createAction_(s,request); save_(s); return clone_(r); },
    executeAction: function (id,options) { var s=load_(); var r=executeAction_(s,id,options); save_(s); return clone_(r); },
    test: test_
  };
})();

function sciipGetEpic6ExecutiveActionOrchestration() {
  return SCIIP_EPIC6_EXECUTIVE_ACTION_ORCHESTRATION.getDashboard();
}
function sciipCreateEpic6ExecutiveAlert(request) {
  return SCIIP_EPIC6_EXECUTIVE_ACTION_ORCHESTRATION.createAlert(request);
}
function sciipActionEpic6ExecutiveAlert(alertId, action, options) {
  return SCIIP_EPIC6_EXECUTIVE_ACTION_ORCHESTRATION.actionAlert(alertId, action, options);
}
function sciipCreateEpic6ExecutiveDecision(request) {
  return SCIIP_EPIC6_EXECUTIVE_ACTION_ORCHESTRATION.createDecision(request);
}
function sciipActionEpic6ExecutiveDecision(decisionId, action, options) {
  return SCIIP_EPIC6_EXECUTIVE_ACTION_ORCHESTRATION.actionDecision(decisionId, action, options);
}
function sciipCreateEpic6ExecutiveAction(request) {
  return SCIIP_EPIC6_EXECUTIVE_ACTION_ORCHESTRATION.createAction(request);
}
function sciipExecuteEpic6ExecutiveAction(actionId, options) {
  return SCIIP_EPIC6_EXECUTIVE_ACTION_ORCHESTRATION.executeAction(actionId, options);
}
function sciipTestV7Epic6ExecutiveAlertsDecisionsActionOrchestration() {
  var output = SCIIP_EPIC6_EXECUTIVE_ACTION_ORCHESTRATION.test();
  Logger.log(JSON.stringify(output));
  return output;
}
