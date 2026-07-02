/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessorLegacy1670_();
      return sciipWrapLegacyRuntimeResult1670_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1670_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v4.1
 * 1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessorLegacy1670_() {
  const processor =
    '1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemReplicaScope',
      'systemReplicaName',
      'systemReplicaStatus',
      'systemReplicaSummary',
      'replicaDateKey',
      'mirrorBusinessKey',
      'mirrorName',
      'mirrorStatus',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'replicaPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemReplicaScope',
      'systemReplicaName',
      'systemReplicaStatus',
      'systemReplicaSummary',
      'replicaDateKey',
      'mirrorBusinessKey',
      'mirrorName',
      'mirrorStatus',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'replicaPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_REPLICA_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    replicaBusinessKey: sourceRecord.businessKey || '',
    replicaName: sourceRecord.systemReplicaName || '',
    replicaStatus: sourceRecord.systemReplicaStatus || '',
    replicaDateKey: sourceRecord.replicaDateKey || dateKey,
    mirrorBusinessKey: sourceRecord.mirrorBusinessKey || '',
    snapshotBusinessKey: sourceRecord.snapshotBusinessKey || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemReplicaScope || '',
    sourceRecord.systemReplicaName || '',
    sourceRecord.systemReplicaStatus || '',
    sourceRecord.systemReplicaSummary || '',
    sourceRecord.replicaDateKey || dateKey,
    sourceRecord.mirrorBusinessKey || '',
    sourceRecord.mirrorName || '',
    sourceRecord.mirrorStatus || '',
    sourceRecord.snapshotBusinessKey || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.replicaPayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor',
      result
    })
  );

  return result;
}