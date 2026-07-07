/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Orchestrator Processor
 * File: 2550_AutonomousRuntimeOrchestratorProcessor.gs
 *
 * Processor: 2550_AutonomousRuntimeOrchestrator
 *
 * Purpose:
 * Summarizes autonomous runtime state and records the orchestration
 * decision loop without executing dynamic dispatch yet.
 */

function sciipRun2550_AutonomousRuntimeOrchestratorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2550_AutonomousRuntimeOrchestrator',
    action: 'AUTONOMOUS_RUNTIME_ORCHESTRATION_DECISION',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_MONITOR',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_ORCHESTRATION_LEDGER',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_ORCHESTRATION_DECISION_LEDGER',

    buildPayload: function(context, definition) {
      var monitorRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: monitorRecords.length,
        outputCount: 1,
        summary: 'Autonomous runtime orchestrator payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2540_AutonomousRuntimeMonitor',
          runtimeVersion: 'v5.3',
          orchestrationMode: 'DRY_RUN'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing monitor source sheet.');
      if (!definition.targetSheet) errors.push('Missing orchestration ledger target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing orchestration decision ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var monitorRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var latestMonitor =
        monitorRecords && monitorRecords.length
          ? monitorRecords[monitorRecords.length - 1]
          : null;

      var orchestrationHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Processor',
        'Business_Key',
        'Orchestration_Mode',
        'Monitor_Status',
        'Runtime_Readiness',
        'Orchestration_Decision',
        'Dispatch_Execution_Allowed',
        'Decision_Reason',
        'Next_Processor',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var decisionLedgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Runtime_Readiness',
        'Orchestration_Decision',
        'Result_JSON'
      ];

      var monitorStatus = latestMonitor
        ? String(latestMonitor.Monitor_Status || '')
        : 'NO_MONITOR_RECORD';

      var runtimeReadiness = 'READY_FOR_GOVERNANCE_REVIEW';
      var orchestrationDecision = 'CONTINUE_DRY_RUN_MODE';
      var dispatchExecutionAllowed = 'NO';
      var decisionReason =
        'Runtime surfaces are being orchestrated in dry-run mode until governance guardrails are certified.';

      if (monitorStatus === 'ATTENTION_REQUIRED' || monitorStatus === 'NO_MONITOR_RECORD') {
        runtimeReadiness = 'ATTENTION_REQUIRED';
        orchestrationDecision = 'PAUSE_DYNAMIC_EXECUTION';
        dispatchExecutionAllowed = 'NO';
        decisionReason =
          'Runtime monitor indicates attention required or no monitor record is available.';
      }

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        orchestrationHeaders,
        {
          Timestamp: new Date(),
          Runtime_Version: 'v5.3',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Orchestration_Mode: 'DRY_RUN',
          Monitor_Status: monitorStatus,
          Runtime_Readiness: runtimeReadiness,
          Orchestration_Decision: orchestrationDecision,
          Dispatch_Execution_Allowed: dispatchExecutionAllowed,
          Decision_Reason: decisionReason,
          Next_Processor: '2560_AutonomousRuntimeGovernance',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: monitorRecords.length,
        processed: 1,
        message: JSON.stringify({
          autonomousRuntimeOrchestrationStatus: 'DECISION_RECORDED',
          runtimeVersion: 'v5.3',
          monitorStatus: monitorStatus,
          runtimeReadiness: runtimeReadiness,
          orchestrationDecision: orchestrationDecision,
          dispatchExecutionAllowed: dispatchExecutionAllowed,
          transactionId: transaction.transactionId,
          nextProcessor: '2560_AutonomousRuntimeGovernance'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        decisionLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'ORCHESTRATION_DECISION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Runtime_Readiness: runtimeReadiness,
          Orchestration_Decision: orchestrationDecision,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          monitorStatus: monitorStatus,
          runtimeReadiness: runtimeReadiness,
          orchestrationDecision: orchestrationDecision,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime orchestration decision recorded.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2550_AutonomousRuntimeOrchestratorProcessor() {
  var result = sciipRun2550_AutonomousRuntimeOrchestratorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2550_AutonomousRuntimeOrchestratorProcessor',
    result: result
  }));

  return result;
}