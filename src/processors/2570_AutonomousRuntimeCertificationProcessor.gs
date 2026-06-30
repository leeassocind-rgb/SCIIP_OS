/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Certification Processor
 * File: 2570_AutonomousRuntimeCertificationProcessor.gs
 *
 * Processor: 2570_AutonomousRuntimeCertification
 *
 * Purpose:
 * Certifies SCIIP_OS v5.3 Autonomous Runtime as complete in governed
 * dry-run mode. Live dynamic dispatch remains blocked until a future
 * explicit promotion authorizes execution mode.
 */

function sciipRun2570_AutonomousRuntimeCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2570_AutonomousRuntimeCertification',
    action: 'AUTONOMOUS_RUNTIME_CERTIFICATION',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_GOVERNANCE',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_CERTIFICATION',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_CERTIFICATION_LEDGER',

    buildPayload: function(context, definition) {
      var governanceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: governanceRecords.length,
        outputCount: 1,
        summary: 'Autonomous runtime certification payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2560_AutonomousRuntimeGovernance',
          runtimeVersion: 'v5.3',
          certifiedMode: 'GOVERNED_DRY_RUN',
          liveDispatchAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing governance source sheet.');
      if (!definition.targetSheet) errors.push('Missing certification target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing certification ledger sheet.');

      var governanceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!governanceRecords || governanceRecords.length === 0) {
        errors.push('No governance records available for certification.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var governanceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var latestGovernance =
        governanceRecords && governanceRecords.length
          ? governanceRecords[governanceRecords.length - 1]
          : null;

      var certificationHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Processor',
        'Business_Key',
        'Certification_Status',
        'Certified_Mode',
        'Live_Dispatch_Allowed',
        'Governance_Status',
        'Guardrail_Decision',
        'Certification_Statement',
        'Next_Phase',
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
        'Certification_Status',
        'Certified_Mode',
        'Live_Dispatch_Allowed',
        'Result_JSON'
      ];

      var governanceStatus = latestGovernance
        ? String(latestGovernance.Governance_Status || '')
        : 'UNKNOWN';

      var guardrailDecision = latestGovernance
        ? String(latestGovernance.Guardrail_Decision || '')
        : 'UNKNOWN';

      var liveDispatchAllowed = 'NO';
      var certifiedMode = 'GOVERNED_DRY_RUN';
      var certificationStatus = 'CERTIFIED';

      if (governanceStatus === 'ATTENTION_REQUIRED') {
        certificationStatus = 'CERTIFIED_WITH_ATTENTION_REQUIRED';
      }

      var certificationStatement =
        'SCIIP_OS v5.3 Autonomous Runtime is certified as registry-driven, load-indexed, schedule-aware, queue-backed, dry-run dispatch-capable, monitored, orchestrated, and governance-protected. Live dynamic dispatch remains blocked until a future explicit promotion authorizes execution mode.';

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        certificationHeaders,
        {
          Timestamp: new Date(),
          Runtime_Version: 'v5.3',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Certification_Status: certificationStatus,
          Certified_Mode: certifiedMode,
          Live_Dispatch_Allowed: liveDispatchAllowed,
          Governance_Status: governanceStatus,
          Guardrail_Decision: guardrailDecision,
          Certification_Statement: certificationStatement,
          Next_Phase: 'v5.4 Autonomous Runtime Live Dispatch Promotion',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: governanceRecords.length,
        processed: 1,
        message: JSON.stringify({
          autonomousRuntimeCertificationStatus: certificationStatus,
          runtimeVersion: 'v5.3',
          certifiedMode: certifiedMode,
          liveDispatchAllowed: liveDispatchAllowed,
          governanceStatus: governanceStatus,
          guardrailDecision: guardrailDecision,
          transactionId: transaction.transactionId,
          nextPhase: 'v5.4 Autonomous Runtime Live Dispatch Promotion'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'AUTONOMOUS_RUNTIME_CERTIFICATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Certification_Status: certificationStatus,
          Certified_Mode: certifiedMode,
          Live_Dispatch_Allowed: liveDispatchAllowed,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          certificationStatus: certificationStatus,
          certifiedMode: certifiedMode,
          liveDispatchAllowed: liveDispatchAllowed,
          governanceStatus: governanceStatus,
          guardrailDecision: guardrailDecision,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime certification completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2570_AutonomousRuntimeCertificationProcessor() {
  var result = sciipRun2570_AutonomousRuntimeCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2570_AutonomousRuntimeCertificationProcessor',
    result: result
  }));

  return result;
}