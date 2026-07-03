/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Protection Layer
 * 2860_SuperSheetImportDailyBriefProcessor
 *
 * SUPERSHEET_IMPORT_COMMAND_CENTER → SUPERSHEET_IMPORT_DAILY_BRIEF
 *
 * Purpose:
 * Converts SuperSheet import command-center posture into a
 * daily operational brief before activation or downstream matching.
 *******************************************************/

function sciipGet2860_SuperSheetImportDailyBriefProcessorName_() {
  return '2860_SuperSheetImportDailyBrief';
}

function sciipGet2860_SuperSheetImportDailyBriefHeaders_() {
  return [
    'Daily_Brief_ID',
    'Business_Key',
    'Brief_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Brief_Status',
    'Import_Posture',
    'Brief_Severity',
    'Brief_Title',
    'Brief_Summary',
    'Recommended_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2860_SuperSheetImportDailyBriefSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_IMPORT_DAILY_BRIEF',
    sciipGet2860_SuperSheetImportDailyBriefHeaders_()
  );
}

function sciipRun2860_SuperSheetImportDailyBriefProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2860_SuperSheetImportDailyBriefProcessorName_(),
    action: 'SUPERSHEET_IMPORT_DAILY_BRIEF_BUILD',
    sourceSheet: 'SUPERSHEET_IMPORT_COMMAND_CENTER',
    targetSheet: 'SUPERSHEET_IMPORT_DAILY_BRIEF',
    ledgerSheet: 'SUPERSHEET_IMPORT_DAILY_BRIEF_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import daily brief runtime payload created.',
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
          processor: sciipGet2860_SuperSheetImportDailyBriefProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importDailyBriefStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2850_SuperSheetImportCommandCenterProcessor after 2840 creates import certification ledger summaries.'
          })
        });
      }

      const briefDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const dailyBriefBusinessKey = 'SUPERSHEET_IMPORT_DAILY_BRIEF|' + briefDate;

      if (sciip2860_RuntimeBusinessKeyPrefixExists_(definition.targetSheet, dailyBriefBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2860_SuperSheetImportDailyBriefProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importDailyBriefStatus: 'DUPLICATE_SKIPPED',
            skippedDuplicate: 1,
            importDailyBriefBusinessKey: dailyBriefBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const posture = sciip2860_DeriveImportPosture_(sourceRecords);
      const briefStatus = sciip2860_DeriveBriefStatus_(posture);
      const severity = sciip2860_DeriveBriefSeverity_(posture);
      const briefTitle = sciip2860_CreateBriefTitle_(briefDate, posture);
      const briefSummary = sciip2860_CreateBriefSummary_(posture, briefStatus, sourceRecords.length);
      const recommendedAction = sciip2860_CreateRecommendedAction_(posture);

      const outputSheet = sciipEnsure2860_SuperSheetImportDailyBriefSheet_();
      outputSheet.appendRow([
        'SUPERSHEET_IMPORT_DAILY_BRIEF_' + Utilities.getUuid(),
        dailyBriefBusinessKey,
        briefDate,
        definition.sourceSheet,
        sourceRecords.length,
        briefStatus,
        posture,
        severity,
        briefTitle,
        briefSummary,
        recommendedAction,
        new Date().toISOString(),
        sciipGet2860_SuperSheetImportDailyBriefProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2860_SuperSheetImportDailyBriefProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          importDailyBriefStatus: briefStatus,
          importPosture: posture,
          briefSeverity: severity,
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          sourceRecordsReviewed: sourceRecords.length,
          transactionId: transaction.transactionId,
          nextProcessor: '2870_SuperSheetImportDailyBriefLedgerProcessor'
        })
      });
    }
  });
}

function sciip2860_DeriveImportPosture_(records) {
  const text = JSON.stringify(records || []).toUpperCase();

  if (text.indexOf('BLOCKED') !== -1 || text.indexOf('FAILED') !== -1 || text.indexOf('NOT_CERTIFIED') !== -1) {
    return 'IMPORT_BLOCKED';
  }

  if (text.indexOf('REVIEW') !== -1 || text.indexOf('PENDING') !== -1 || text.indexOf('PARTIAL') !== -1) {
    return 'IMPORT_REVIEW_REQUIRED';
  }

  if (text.indexOf('IMPORT_READY') !== -1 || text.indexOf('CERTIFIED') !== -1 || text.indexOf('READY') !== -1 || text.indexOf('PASS') !== -1) {
    return 'IMPORT_READY';
  }

  return 'IMPORT_UNKNOWN';
}

function sciip2860_DeriveBriefStatus_(posture) {
  if (posture === 'IMPORT_READY') return 'DAILY_BRIEF_IMPORT_READY';
  if (posture === 'IMPORT_BLOCKED') return 'DAILY_BRIEF_IMPORT_BLOCKED';
  if (posture === 'IMPORT_REVIEW_REQUIRED') return 'DAILY_BRIEF_REVIEW_REQUIRED';
  return 'DAILY_BRIEF_IMPORT_UNKNOWN';
}

function sciip2860_DeriveBriefSeverity_(posture) {
  if (posture === 'IMPORT_READY') return 'LOW';
  if (posture === 'IMPORT_BLOCKED') return 'HIGH';
  if (posture === 'IMPORT_REVIEW_REQUIRED') return 'MEDIUM';
  return 'MEDIUM';
}

function sciip2860_CreateBriefTitle_(briefDate, posture) {
  return 'SuperSheet Import Daily Brief — ' + briefDate + ' — ' + posture;
}

function sciip2860_CreateBriefSummary_(posture, briefStatus, sourceRecordCount) {
  return [
    'SuperSheet import daily brief generated from command-center posture.',
    'Posture: ' + posture + '.',
    'Brief status: ' + briefStatus + '.',
    'Reviewed ' + sourceRecordCount + ' command-center record(s).'
  ].join(' ');
}

function sciip2860_CreateRecommendedAction_(posture) {
  if (posture === 'IMPORT_READY') {
    return 'Proceed toward SuperSheet import activation and downstream matching preparation.';
  }

  if (posture === 'IMPORT_BLOCKED') {
    return 'Do not activate import. Review failed or blocked quality/certification conditions.';
  }

  if (posture === 'IMPORT_REVIEW_REQUIRED') {
    return 'Route import posture to operator review before activation.';
  }

  return 'Wait for command-center posture to resolve before import activation.';
}

function sciip2860_RuntimeBusinessKeyPrefixExists_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2860_SuperSheetImportDailyBriefProcessor() {
  const result = sciipRun2860_SuperSheetImportDailyBriefProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2860_SuperSheetImportDailyBriefProcessor',
    result: result
  }));

  return result;
}
