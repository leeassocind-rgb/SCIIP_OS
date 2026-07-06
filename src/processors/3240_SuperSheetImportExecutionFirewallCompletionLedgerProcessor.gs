/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3240_SuperSheetImportExecutionFirewallCompletionLedgerProcessor
 *******************************************************/

function sciipGet3240ProcessorName_() {
  return '3240_SuperSheetImportExecutionFirewallCompletionLedger';
}

function sciipGet3240SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETIONS';
}

function sciipGet3240TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_LEDGER_SUMMARY';
}

function sciipGet3240Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_LEDGER_SUMMARY';
}

function sciipGet3240Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Firewall_Completion_Ready_Count',
    'Firewall_Completion_Blocked_Count',
    'Review_Required_Count',
    'Firewall_Completion_Ledger_Status',
    'Firewall_Completion_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3240TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3240TargetSheet_(),
    sciipGet3240Headers_()
  );
}

function sciipRun3240_SuperSheetImportExecutionFirewallCompletionLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3240ProcessorName_(),
    action: sciipGet3240Action_(),
    sourceSheet: sciipGet3240SourceSheet_(),
    targetSheet: sciipGet3240TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_LEDGER_RUNTIME_LEDGER',

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
        summary:
          'SuperSheet import execution firewall completion ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3240TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3240ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            firewallCompletionLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3230_SuperSheetImportExecutionFirewallCompletionProcessor after 3220 creates firewall-completion-ready closeout ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_LEDGER|' +
        ledgerDate;

      if (sciip3240BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3240ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            firewallCompletionLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3240CountFirewallCompletionLedgerRecords_(sourceRecords);
      const posture = sciip3240ResolveFirewallCompletionLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_LEDGER_' +
          Utilities.getUuid(),
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
        sciipGet3240ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3240ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          firewallCompletionLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          firewallCompletionReadyCount: counts.ready,
          firewallCompletionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          firewallCompletionLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3250_SuperSheetImportExecutionFirewallFinalCertificationProcessor'
        })
      });
    }
  });
}

function sciip3240BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3240CountFirewallCompletionLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('FIREWALL_COMPLETION_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_FIREWALL_COMPLETION_READY') !== -1 ||
      statusText.indexOf('FIREWALL_COMPLETION_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('FIREWALL_COMPLETION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3240ResolveFirewallCompletionLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'FIREWALL_COMPLETION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'FIREWALL_FINAL_CERTIFICATION_BLOCKED',
      summary:
        'SuperSheet import execution firewall completion ledger recorded blocking conditions.',
      nextAction:
        'Review blocked firewall completion records before final firewall certification.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'FIREWALL_COMPLETION_LEDGER_READY',
      posture: 'FIREWALL_FINAL_CERTIFICATION_READY',
      summary:
        'All SuperSheet import execution firewall completion records are ready for final firewall certification.',
      nextAction:
        'Proceed to SuperSheet import execution firewall final certification.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'FIREWALL_COMPLETION_LEDGER_PARTIAL_READY',
      posture: 'FIREWALL_FINAL_CERTIFICATION_REVIEW_REQUIRED',
      summary:
        'Some firewall completion records are ready, but final firewall certification requires review.',
      nextAction:
        'Review firewall completion records before final firewall certification.'
    };
  }

  return {
    status: 'FIREWALL_COMPLETION_LEDGER_REVIEW_REQUIRED',
    posture: 'FIREWALL_FINAL_CERTIFICATION_REVIEW_REQUIRED',
    summary:
      'No final-certification-ready SuperSheet import execution firewall completion records were found.',
    nextAction:
      'Run upstream firewall completion processor with firewall-completion-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3240_SuperSheetImportExecutionFirewallCompletionLedgerProcessor() {
  const result =
    sciipRun3240_SuperSheetImportExecutionFirewallCompletionLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3240_SuperSheetImportExecutionFirewallCompletionLedgerProcessor',
    result: result
  }));

  return result;
}