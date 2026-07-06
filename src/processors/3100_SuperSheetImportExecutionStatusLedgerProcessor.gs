/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3100_SuperSheetImportExecutionStatusLedgerProcessor
 *******************************************************/

function sciipGet3100ProcessorName_() {
  return '3100_SuperSheetImportExecutionStatusLedger';
}

function sciipGet3100SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_STATUSES';
}

function sciipGet3100TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_SUMMARY';
}

function sciipGet3100Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_SUMMARY';
}

function sciipGet3100Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Active_Count',
    'Execution_Blocked_Count',
    'Review_Required_Count',
    'Execution_Status_Ledger_Status',
    'Execution_Status_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3100TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3100TargetSheet_(),
    sciipGet3100Headers_()
  );
}

function sciipRun3100_SuperSheetImportExecutionStatusLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3100ProcessorName_(),
    action: sciipGet3100Action_(),
    sourceSheet: sciipGet3100SourceSheet_(),
    targetSheet: sciipGet3100TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution status ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3100TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3100ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionStatusLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3090_SuperSheetImportExecutionStatusProcessor after 3080 creates execution monitor ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER|' + ledgerDate;

      if (sciip3100BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3100ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionStatusLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3100CountExecutionStatusRecords_(sourceRecords);
      const posture = sciip3100ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.active,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3100ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3100ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionStatusLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionActiveCount: counts.active,
          executionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionStatusPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3110_SuperSheetImportExecutionCompletionProcessor'
        })
      });
    }
  });
}

function sciip3100BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3100CountExecutionStatusRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_STATUS_ACTIVE') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_ACTIVE') !== -1 ||
      statusText.indexOf('EXECUTION_ACTIVE') !== -1
    ) {
      counts.active += 1;
    } else if (
      statusText.indexOf('EXECUTION_STATUS_BLOCKED') !== -1 ||
      statusText.indexOf('EXECUTION_NOT_ACTIVE') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { active: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3100ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'EXECUTION_STATUS_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      summary: 'SuperSheet import execution status ledger recorded blocking conditions.',
      nextAction: 'Review blocked execution status records before execution completion.'
    };
  }

  if (counts.active > 0 && counts.active === total) {
    return {
      status: 'EXECUTION_STATUS_LEDGER_ACTIVE',
      posture: 'IMPORT_EXECUTION_ACTIVE',
      summary: 'All SuperSheet import execution status records are active.',
      nextAction: 'Proceed to SuperSheet import execution completion.'
    };
  }

  if (counts.active > 0) {
    return {
      status: 'EXECUTION_STATUS_LEDGER_PARTIAL_ACTIVE',
      posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import execution status records are active, but not all records reached active execution posture.',
      nextAction: 'Review execution status records before completion.'
    };
  }

  return {
    status: 'EXECUTION_STATUS_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    summary: 'No active SuperSheet import execution status records were found.',
    nextAction: 'Run upstream execution status processor with active monitor ledger input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3100_SuperSheetImportExecutionStatusLedgerProcessor() {
  const result = sciipRun3100_SuperSheetImportExecutionStatusLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3100_SuperSheetImportExecutionStatusLedgerProcessor',
    result: result
  }));

  return result;
}