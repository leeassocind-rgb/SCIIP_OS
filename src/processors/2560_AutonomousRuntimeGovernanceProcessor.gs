/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Governance Processor
 * File: 2560_AutonomousRuntimeGovernanceProcessor.gs
 *
 * Processor: 2560_AutonomousRuntimeGovernance
 *
 * Purpose:
 * Applies governance guardrails to v5.3 Autonomous Runtime.
 * Keeps live dynamic dispatch blocked until explicitly certified.
 */

function sciipRun2560_AutonomousRuntimeGovernanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2560_AutonomousRuntimeGovernance',
    action: 'AUTONOMOUS_RUNTIME_GOVERNANCE_REVIEW',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_ORCHESTRATION_LEDGER',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_GOVERNANCE',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_GOVERNANCE_LEDGER',

    buildPayload: function(context, definition) {
      var orchestrationRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: orchestrationRecords.length,
        outputCount: 1,
        summary: 'Autonomous runtime governance payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2550_AutonomousRuntimeOrchestrator',
          runtimeVersion: 'v5.3',
          governanceMode: 'SAFE_DRY_RUN'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing orchestration source sheet.');
      if (!definition.targetSheet) errors.push('Missing governance target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing governance ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var orchestrationRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var latestOrchestration =
        orchestrationRecords && orchestrationRecords.length
          ? orchestrationRecords[orchestrationRecords.length - 1]
          : null;

      var governanceHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Processor',
        'Business_Key',
        'Governance_Status',
        'Governance_Mode',
        'Live_Dispatch_Allowed',
        'Required_Certification',
        'Orchestration_Decision',
        'Runtime_Readiness',
        'Guardrail_Decision',
        'Guardrail_Reason',
        'Next_Processor',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Governance_Status',
        'Live_Dispatch_Allowed',
        'Result_JSON'
      ];

      var orchestrationDecision = latestOrchestration
        ? String(latestOrchestration.Orchestration_Decision || '')
        : 'NO_ORCHESTRATION_RECORD';

      var runtimeReadiness = latestOrchestration
        ? String(latestOrchestration.Runtime_Readiness || '')
        : 'UNKNOWN';

      var governanceStatus = 'GOVERNED';
      var governanceMode = 'SAFE_DRY_RUN';
      var liveDispatchAllowed = 'NO';
      var requiredCertification = '2570_AutonomousRuntimeCertification';
      var guardrailDecision = 'LIVE_EXECUTION_BLOCKED';
      var guardrailReason =
        'Dynamic live dispatch remains blocked until v5.3 autonomous runtime certification explicitly permits live execution.';

      if (runtimeReadiness === 'ATTENTION_REQUIRED') {
        governanceStatus = 'ATTENTION_REQUIRED';
        guardrailDecision = 'LIVE_EXECUTION_BLOCKED_ATTENTION_REQUIRED';
        guardrailReason =
          'Runtime readiness indicates attention required. Live dispatch is blocked.';
      }

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        governanceHeaders,
        {
          Timestamp: new Date(),
          Runtime_Version: 'v5.3',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Governance_Status: governanceStatus,
          Governance_Mode: governanceMode,
          Live_Dispatch_Allowed: liveDispatchAllowed,
          Required_Certification: requiredCertification,
          Orchestration_Decision: orchestrationDecision,
          Runtime_Readiness: runtimeReadiness,
          Guardrail_Decision: guardrailDecision,
          Guardrail_Reason: guardrailReason,
          Next_Processor: '2570_AutonomousRuntimeCertification',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: orchestrationRecords.length,
        processed: 1,
        message: JSON.stringify({
          autonomousRuntimeGovernanceStatus: governanceStatus,
          runtimeVersion: 'v5.3',
          governanceMode: governanceMode,
          liveDispatchAllowed: liveDispatchAllowed,
          guardrailDecision: guardrailDecision,
          transactionId: transaction.transactionId,
          nextProcessor: '2570_AutonomousRuntimeCertification'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'GOVERNANCE_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Governance_Status: governanceStatus,
          Live_Dispatch_Allowed: liveDispatchAllowed,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          governanceStatus: governanceStatus,
          governanceMode: governanceMode,
          liveDispatchAllowed: liveDispatchAllowed,
          guardrailDecision: guardrailDecision,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime governance completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2560_AutonomousRuntimeGovernanceProcessor() {
  var result = sciipRun2560_AutonomousRuntimeGovernanceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2560_AutonomousRuntimeGovernanceProcessor',
    result: result
  }));

  return result;
}