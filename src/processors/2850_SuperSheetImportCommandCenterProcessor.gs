/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Protection Layer
 * 2850_SuperSheetImportCommandCenterProcessor
 *
 * SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_SUMMARY → SUPERSHEET_IMPORT_COMMAND_CENTER
 *
 * Purpose:
 * Surfaces SuperSheet import certification posture to the
 * command center before import activation or downstream matching.
 *******************************************************/

function sciipGet2850_SuperSheetImportCommandCenterProcessorName_() {
  return '2850_SuperSheetImportCommandCenter';
}

function sciipGet2850_SuperSheetImportCommandCenterHeaders_() {
  return [
    'Command_Center_ID',
    'Business_Key',
    'Command_Center_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Import_Command_Status',
    'Import_Posture',
    'Command_Severity',
    'Command_Summary',
    'Recommended_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2850_SuperSheetImportCommandCenterSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_IMPORT_COMMAND_CENTER',
    sciipGet2850_SuperSheetImportCommandCenterHeaders_()
  );
}

function sciipRun2850_SuperSheetImportCommandCenterProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2850_SuperSheetImportCommandCenterProcessorName_(),
    action: 'SUPERSHEET_IMPORT_COMMAND_CENTER_UPDATE',
    sourceSheet: 'SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_COMMAND_CENTER',
    ledgerSheet: 'SUPERSHEET_IMPORT_COMMAND_CENTER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import command center runtime payload created.',
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
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2850_SuperSheetImportCommandCenterProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importCommandCenterStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2840_SuperSheetImportCertificationLedgerProcessor after 2830 creates import certification records.'
          })
        });
      }

      const commandCenterDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const commandCenterBusinessKey = 'SUPERSHEET_IMPORT_COMMAND_CENTER|' + commandCenterDate;

      if (sciip2850_RuntimeBusinessKeyPrefixExists_(definition.targetSheet, commandCenterBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2850_SuperSheetImportCommandCenterProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importCommandCenterStatus: 'DUPLICATE_SKIPPED',
            skippedDuplicate: 1,
            importCommandCenterBusinessKey: commandCenterBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const posture = sciip2850_DeriveImportPosture_(sourceRecords);
      const commandStatus = sciip2850_DeriveCommandStatus_(posture);
      const severity = sciip2850_DeriveCommandSeverity_(posture);
      const summary = sciip2850_CreateCommandSummary_(posture, commandStatus, sourceRecords.length);
      const recommendedAction = sciip2850_CreateRecommendedAction_(posture);

      const outputSheet = sciipEnsure2850_SuperSheetImportCommandCenterSheet_();
      outputSheet.appendRow([
        'SUPERSHEET_IMPORT_COMMAND_CENTER_' + Utilities.getUuid(),
        commandCenterBusinessKey,
        commandCenterDate,
        definition.sourceSheet,
        sourceRecords.length,
        commandStatus,
        posture,
        severity,
        summary,
        recommendedAction,
        new Date().toISOString(),
        sciipGet2850_SuperSheetImportCommandCenterProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2850_SuperSheetImportCommandCenterProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          importCommandCenterStatus: commandStatus,
          importPosture: posture,
          commandSeverity: severity,
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          sourceRecordsReviewed: sourceRecords.length,
          transactionId: transaction.transactionId,
          nextProcessor: '2860_SuperSheetImportCommandCenterLedgerProcessor'
        })
      });
    }
  });
}

function sciip2850_DeriveImportPosture_(records) {
  const text = JSON.stringify(records || []).toUpperCase();

  if (text.indexOf('BLOCKED') !== -1 || text.indexOf('FAILED') !== -1 || text.indexOf('NOT_CERTIFIED') !== -1) {
    return 'IMPORT_BLOCKED';
  }

  if (text.indexOf('PARTIAL') !== -1 || text.indexOf('PENDING') !== -1 || text.indexOf('REVIEW') !== -1) {
    return 'IMPORT_REVIEW_REQUIRED';
  }

  if (text.indexOf('CERTIFIED') !== -1 || text.indexOf('READY') !== -1 || text.indexOf('PASS') !== -1) {
    return 'IMPORT_READY';
  }

  return 'IMPORT_UNKNOWN';
}

function sciip2850_DeriveCommandStatus_(posture) {
  if (posture === 'IMPORT_READY') return 'COMMAND_CENTER_IMPORT_READY';
  if (posture === 'IMPORT_BLOCKED') return 'COMMAND_CENTER_IMPORT_BLOCKED';
  if (posture === 'IMPORT_REVIEW_REQUIRED') return 'COMMAND_CENTER_REVIEW_REQUIRED';
  return 'COMMAND_CENTER_IMPORT_UNKNOWN';
}

function sciip2850_DeriveCommandSeverity_(posture) {
  if (posture === 'IMPORT_READY') return 'LOW';
  if (posture === 'IMPORT_BLOCKED') return 'HIGH';
  if (posture === 'IMPORT_REVIEW_REQUIRED') return 'MEDIUM';
  return 'MEDIUM';
}

function sciip2850_CreateCommandSummary_(posture, commandStatus, sourceRecordCount) {
  return [
    'SuperSheet import command center update recorded.',
    'Posture: ' + posture + '.',
    'Command status: ' + commandStatus + '.',
    'Reviewed ' + sourceRecordCount + ' import certification ledger summary record(s).'
  ].join(' ');
}

function sciip2850_CreateRecommendedAction_(posture) {
  if (posture === 'IMPORT_READY') {
    return 'Proceed to SuperSheet import activation planning.';
  }

  if (posture === 'IMPORT_BLOCKED') {
    return 'Hold import activation and review blocked certification ledger summaries.';
  }

  if (posture === 'IMPORT_REVIEW_REQUIRED') {
    return 'Route import posture to operator review before activation.';
  }

  return 'Wait for complete import certification ledger summaries before activation.';
}

function sciip2850_RuntimeBusinessKeyPrefixExists_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2850_SuperSheetImportCommandCenterProcessor() {
  const result = sciipRun2850_SuperSheetImportCommandCenterProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2850_SuperSheetImportCommandCenterProcessor',
    result: result
  }));

  return result;
}
