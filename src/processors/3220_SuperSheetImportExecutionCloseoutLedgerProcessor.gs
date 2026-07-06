/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3220_SuperSheetImportExecutionCloseoutLedgerProcessor
 *******************************************************/

function sciipGet3220ProcessorName_() {
  return '3220_SuperSheetImportExecutionCloseoutLedger';
}

function sciipGet3220SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUTS';
}

function sciipGet3220TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_LEDGER_SUMMARY';
}

function sciipGet3220Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_LEDGER_SUMMARY';
}

function sciipGet3220Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Closeout_Ready_Count',
    'Closeout_Blocked_Count',
    'Review_Required_Count',
    'Closeout_Ledger_Status',
    'Closeout_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3220TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3220TargetSheet_(),
    sciipGet3220Headers_()
  );
}

function sciipRun3220_SuperSheetImportExecutionCloseoutLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3220ProcessorName_(),
    action: sciipGet3220Action_(),
    sourceSheet: sciipGet3220SourceSheet_(),
    targetSheet: sciipGet3220TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution closeout ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3220TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3220ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            closeoutLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3210_SuperSheetImportExecutionCloseoutProcessor after 3200 creates closeout-ready certification ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_LEDGER|' + ledgerDate;

      if (sciip3220BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3220ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            closeoutLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3220CountCloseoutLedgerRecords_(sourceRecords);
      const posture = sciip3220ResolveCloseoutLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
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
        sciipGet3220ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3220ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          closeoutLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          closeoutReadyCount: counts.ready,
          closeoutBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          closeoutLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3230_SuperSheetImportExecutionFirewallCompletionProcessor'
        })
      });
    }
  });
}

function sciip3220BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3220CountCloseoutLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('CLOSEOUT_READY') !== -1 ||
      statusText.indexOf('IMPORT_CLOSEOUT_READY') !== -1 ||
      statusText.indexOf('CLOSEOUT_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('CLOSEOUT_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3220ResolveCloseoutLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'CLOSEOUT_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'FIREWALL_COMPLETION_BLOCKED',
      summary:
        'SuperSheet import execution closeout ledger recorded blocking conditions.',
      nextAction:
        'Review blocked closeout records before firewall completion.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'CLOSEOUT_LEDGER_READY',
      posture: 'FIREWALL_COMPLETION_READY',
      summary:
        'All SuperSheet import execution closeout records are ready for firewall completion.',
      nextAction:
        'Proceed to SuperSheet import execution firewall completion.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'CLOSEOUT_LEDGER_PARTIAL_READY',
      posture: 'FIREWALL_COMPLETION_REVIEW_REQUIRED',
      summary:
        'Some closeout records are ready, but firewall completion requires review.',
      nextAction:
        'Review closeout records before firewall completion.'
    };
  }

  return {
    status: 'CLOSEOUT_LEDGER_REVIEW_REQUIRED',
    posture: 'FIREWALL_COMPLETION_REVIEW_REQUIRED',
    summary:
      'No firewall-completion-ready SuperSheet import execution closeout records were found.',
    nextAction:
      'Run upstream closeout processor with closeout-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3220_SuperSheetImportExecutionCloseoutLedgerProcessor() {
  const result =
    sciipRun3220_SuperSheetImportExecutionCloseoutLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3220_SuperSheetImportExecutionCloseoutLedgerProcessor',
    result: result
  }));

  return result;
}