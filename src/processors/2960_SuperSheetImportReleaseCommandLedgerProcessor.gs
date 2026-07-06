/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2960_SuperSheetImportReleaseCommandLedgerProcessor
 *******************************************************/

function sciipGet2960ProcessorName_() {
  return '2960_SuperSheetImportReleaseCommandLedger';
}

function sciipGet2960SourceSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_COMMANDS';
}

function sciipGet2960TargetSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_COMMAND_LEDGER_SUMMARY';
}

function sciipGet2960Action_() {
  return 'SUPERSHEET_IMPORT_RELEASE_COMMAND_LEDGER_SUMMARY';
}

function sciipGet2960Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Command_Issued_Count',
    'Command_Blocked_Count',
    'Review_Required_Count',
    'Release_Command_Ledger_Status',
    'Release_Command_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2960TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2960TargetSheet_(),
    sciipGet2960Headers_()
  );
}

function sciipRun2960_SuperSheetImportReleaseCommandLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2960ProcessorName_(),
    action: sciipGet2960Action_(),
    sourceSheet: sciipGet2960SourceSheet_(),
    targetSheet: sciipGet2960TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_RELEASE_COMMAND_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import release command ledger runtime payload created.',
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
      const targetSheet = sciipEnsure2960TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2960ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            releaseCommandLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2950_SuperSheetImportReleaseCommandProcessor after 2940 creates release authorization ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_RELEASE_COMMAND_LEDGER|' + ledgerDate;

      if (sciip2960BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2960ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            releaseCommandLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip2960CountCommandStatuses_(sourceRecords);
      const posture = sciip2960ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_RELEASE_COMMAND_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.commandIssued,
        counts.commandBlocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet2960ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2960ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          releaseCommandLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          commandIssuedCount: counts.commandIssued,
          commandBlockedCount: counts.commandBlocked,
          reviewRequiredCount: counts.reviewRequired,
          releaseCommandPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2970_SuperSheetImportExecutionHandoffProcessor'
        })
      });
    }
  });
}

function sciip2960BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2960CountCommandStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('RELEASE_COMMAND_ISSUED') !== -1 ||
      statusText.indexOf('IMPORT_RELEASE_COMMAND_ISSUED') !== -1 ||
      statusText.indexOf('COMMAND_ISSUED') !== -1
    ) {
      counts.commandIssued += 1;
    } else if (
      statusText.indexOf('RELEASE_COMMAND_BLOCKED') !== -1 ||
      statusText.indexOf('COMMAND_NOT_ISSUED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.commandBlocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { commandIssued: 0, commandBlocked: 0, reviewRequired: 0 });
}

function sciip2960ResolvePosture_(counts, total) {
  if (counts.commandBlocked > 0) {
    return {
      status: 'RELEASE_COMMAND_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_RELEASE_BLOCKED',
      summary: 'SuperSheet import release command ledger recorded blocking conditions.',
      nextAction: 'Review blocked command records before execution handoff.'
    };
  }

  if (counts.commandIssued > 0 && counts.commandIssued === total) {
    return {
      status: 'RELEASE_COMMAND_LEDGER_ISSUED',
      posture: 'IMPORT_RELEASE_COMMAND_ISSUED',
      summary: 'All SuperSheet import release command records were issued successfully.',
      nextAction: 'Proceed to SuperSheet import execution handoff.'
    };
  }

  if (counts.commandIssued > 0) {
    return {
      status: 'RELEASE_COMMAND_LEDGER_PARTIAL_ISSUANCE',
      posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import release command records were issued, but not all records reached command-issued posture.',
      nextAction: 'Review release command records before execution handoff.'
    };
  }

  return {
    status: 'RELEASE_COMMAND_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
    summary: 'No issued SuperSheet import release command records were found.',
    nextAction: 'Run upstream release command processor with authorized input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2960_SuperSheetImportReleaseCommandLedgerProcessor() {
  const result = sciipRun2960_SuperSheetImportReleaseCommandLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2960_SuperSheetImportReleaseCommandLedgerProcessor',
    result: result
  }));

  return result;
}