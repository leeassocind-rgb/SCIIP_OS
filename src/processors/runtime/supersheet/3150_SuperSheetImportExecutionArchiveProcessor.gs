/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3150_SuperSheetImportExecutionArchiveProcessor
 *******************************************************/

function sciipGet3150ProcessorName_() {
  return '3150_SuperSheetImportExecutionArchive';
}

function sciipGet3150SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FINALIZATION_LEDGER_SUMMARY';
}

function sciipGet3150TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVES';
}

function sciipGet3150Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVES';
}

function sciipGet3150Headers_() {
  return [
    'Archive_ID',
    'Business_Key',
    'Archive_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Archive_Ready_Count',
    'Archive_Blocked_Count',
    'Review_Required_Count',
    'Archive_Status',
    'Archive_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3150TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3150TargetSheet_(),
    sciipGet3150Headers_()
  );
}

function sciipRun3150_SuperSheetImportExecutionArchiveProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3150ProcessorName_(),
    action: sciipGet3150Action_(),
    sourceSheet: sciipGet3150SourceSheet_(),
    targetSheet: sciipGet3150TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution archive runtime payload created.',
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
      const targetSheet = sciipEnsure3150TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3150ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            archiveStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3140_SuperSheetImportExecutionFinalizationLedgerProcessor after 3130 creates finalization records.'
          })
        });
      }

      const archiveDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const archiveBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE|' + archiveDate;

      if (sciip3150BusinessKeyExists_(definition.targetSheet, archiveBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3150ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            archiveStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            archiveBusinessKey: archiveBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3150CountArchiveRecords_(sourceRecords);
      const posture = sciip3150ResolveArchivePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_' + Utilities.getUuid(),
        archiveBusinessKey,
        archiveDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3150ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3150ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          archiveStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          archiveReadyCount: counts.ready,
          archiveBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          archivePosture: posture.posture,
          archiveBusinessKey: archiveBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3160_SuperSheetImportExecutionArchiveLedgerProcessor'
        })
      });
    }
  });
}

function sciip3150BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3150CountArchiveRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('FINALIZATION_LEDGER_READY') !== -1 ||
      statusText.indexOf('IMPORT_ARCHIVE_READY') !== -1 ||
      statusText.indexOf('ARCHIVE_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('ARCHIVE_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3150ResolveArchivePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'ARCHIVE_BLOCKED',
      posture: 'IMPORT_ARCHIVE_BLOCKED',
      summary:
        'SuperSheet import execution archive processing is blocked by finalization ledger conditions.',
      nextAction:
        'Review blocked finalization ledger records before archive ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'ARCHIVE_READY',
      posture: 'IMPORT_ARCHIVE_READY',
      summary:
        'SuperSheet import execution is ready for archive processing.',
      nextAction:
        'Proceed to SuperSheet import execution archive ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'ARCHIVE_PARTIAL_READY',
      posture: 'IMPORT_ARCHIVE_REVIEW_REQUIRED',
      summary:
        'Some finalization ledger records are archive-ready, but archive processing requires review.',
      nextAction:
        'Review finalization ledger records before archive ledger summary.'
    };
  }

  return {
    status: 'ARCHIVE_REVIEW_REQUIRED',
    posture: 'IMPORT_ARCHIVE_REVIEW_REQUIRED',
    summary:
      'No archive-ready SuperSheet import execution finalization ledger records were found.',
    nextAction:
      'Run upstream finalization ledger processor with archive-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3150_SuperSheetImportExecutionArchiveProcessor() {
  const result = sciipRun3150_SuperSheetImportExecutionArchiveProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3150_SuperSheetImportExecutionArchiveProcessor',
    result: result
  }));

  return result;
}