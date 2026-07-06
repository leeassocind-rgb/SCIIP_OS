/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2950_SuperSheetImportReleaseCommandProcessor
 *******************************************************/

function sciipGet2950ProcessorName_() {
  return '2950_SuperSheetImportReleaseCommand';
}

function sciipGet2950SourceSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_LEDGER_SUMMARY';
}

function sciipGet2950TargetSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_COMMANDS';
}

function sciipGet2950Action_() {
  return 'SUPERSHEET_IMPORT_RELEASE_COMMAND';
}

function sciipGet2950Headers_() {
  return [
    'Release_Command_ID',
    'Business_Key',
    'Command_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Release_Command_Status',
    'Command_Posture',
    'Command_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2950TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2950TargetSheet_(),
    sciipGet2950Headers_()
  );
}

function sciipRun2950_SuperSheetImportReleaseCommandProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2950ProcessorName_(),
    action: sciipGet2950Action_(),
    sourceSheet: sciipGet2950SourceSheet_(),
    targetSheet: sciipGet2950TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_RELEASE_COMMAND_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import release command runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure2950TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2950ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            releaseCommandStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2940_SuperSheetImportReleaseAuthorizationLedgerProcessor after 2930 creates release authorization records.'
          })
        });
      }

      const commandDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const commandBusinessKey = 'SUPERSHEET_IMPORT_RELEASE_COMMAND|' + commandDate;

      if (sciip2950BusinessKeyExists_(definition.targetSheet, commandBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2950ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            releaseCommandStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            commandBusinessKey: commandBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const command = sciip2950ResolveReleaseCommand_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_RELEASE_COMMAND_' + Utilities.getUuid(),
        commandBusinessKey,
        commandDate,
        definition.sourceSheet,
        sourceRecords.length,
        command.status,
        command.posture,
        command.decision,
        command.blockingReason,
        command.summary,
        command.nextAction,
        new Date().toISOString(),
        sciipGet2950ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2950ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          releaseCommandStatus: command.status,
          commandPosture: command.posture,
          commandDecision: command.decision,
          blockingReason: command.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          commandBusinessKey: commandBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2960_SuperSheetImportReleaseCommandLedgerProcessor'
        })
      });
    }
  });
}

function sciip2950BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2950ResolveReleaseCommand_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('AUTHORIZATION_LEDGER_AUTHORIZED') !== -1 &&
    statusText.indexOf('IMPORT_RELEASE_AUTHORIZED') !== -1
  ) {
    return {
      status: 'RELEASE_COMMAND_ISSUED',
      posture: 'IMPORT_RELEASE_COMMAND_ISSUED',
      decision: 'COMMAND_ISSUED',
      blockingReason: '',
      summary: 'SuperSheet import release command issued based on authorized release ledger posture.',
      nextAction: 'Proceed to release command ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_RELEASE_BLOCKED') !== -1
  ) {
    return {
      status: 'RELEASE_COMMAND_BLOCKED',
      posture: 'IMPORT_RELEASE_BLOCKED',
      decision: 'COMMAND_NOT_ISSUED',
      blockingReason: 'Release authorization ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import release command is blocked.',
      nextAction: 'Review authorization ledger blockers before issuing release command.'
    };
  }

  return {
    status: 'RELEASE_COMMAND_REVIEW_REQUIRED',
    posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Release authorization ledger did not produce a fully authorized release posture.',
    summary: 'SuperSheet import release command requires review.',
    nextAction: 'Review authorization ledger summary before issuing release command.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2950_SuperSheetImportReleaseCommandProcessor() {
  const result = sciipRun2950_SuperSheetImportReleaseCommandProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2950_SuperSheetImportReleaseCommandProcessor',
    result: result
  }));

  return result;
}