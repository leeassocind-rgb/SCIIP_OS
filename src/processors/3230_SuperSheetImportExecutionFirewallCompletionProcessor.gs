/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3230_SuperSheetImportExecutionFirewallCompletionProcessor
 *******************************************************/

function sciipGet3230ProcessorName_() {
  return '3230_SuperSheetImportExecutionFirewallCompletion';
}

function sciipGet3230SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_LEDGER_SUMMARY';
}

function sciipGet3230TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETIONS';
}

function sciipGet3230Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETIONS';
}

function sciipGet3230Headers_() {
  return [
    'Firewall_Completion_ID',
    'Business_Key',
    'Firewall_Completion_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Firewall_Completion_Ready_Count',
    'Firewall_Completion_Blocked_Count',
    'Review_Required_Count',
    'Firewall_Completion_Status',
    'Firewall_Completion_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3230TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3230TargetSheet_(),
    sciipGet3230Headers_()
  );
}

function sciipRun3230_SuperSheetImportExecutionFirewallCompletionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3230ProcessorName_(),
    action: sciipGet3230Action_(),
    sourceSheet: sciipGet3230SourceSheet_(),
    targetSheet: sciipGet3230TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_RUNTIME_LEDGER',

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
          'SuperSheet import execution firewall completion runtime payload created.',
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
      const targetSheet = sciipEnsure3230TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3230ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            firewallCompletionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3220_SuperSheetImportExecutionCloseoutLedgerProcessor after 3210 creates closeout records.'
          })
        });
      }

      const firewallCompletionDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const firewallCompletionBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION|' +
        firewallCompletionDate;

      if (
        sciip3230BusinessKeyExists_(
          definition.targetSheet,
          firewallCompletionBusinessKey
        )
      ) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3230ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            firewallCompletionStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            firewallCompletionBusinessKey: firewallCompletionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3230CountFirewallCompletionRecords_(sourceRecords);
      const posture = sciip3230ResolveFirewallCompletionPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_' + Utilities.getUuid(),
        firewallCompletionBusinessKey,
        firewallCompletionDate,
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
        sciipGet3230ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3230ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          firewallCompletionStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          firewallCompletionReadyCount: counts.ready,
          firewallCompletionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          firewallCompletionPosture: posture.posture,
          firewallCompletionBusinessKey: firewallCompletionBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3240_SuperSheetImportExecutionFirewallCompletionLedgerProcessor'
        })
      });
    }
  });
}

function sciip3230BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3230CountFirewallCompletionRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('FIREWALL_COMPLETION_READY') !== -1 ||
      statusText.indexOf('CLOSEOUT_LEDGER_READY') !== -1 ||
      statusText.indexOf('IMPORT_FIREWALL_COMPLETION_READY') !== -1
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

function sciip3230ResolveFirewallCompletionPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'FIREWALL_COMPLETION_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_FIREWALL_COMPLETION_BLOCKED',
      summary:
        'SuperSheet import execution firewall completion is blocked by closeout ledger conditions.',
      nextAction:
        'Review blocked closeout ledger records before firewall completion ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'FIREWALL_COMPLETION_READY',
      posture: 'SUPERSHEET_IMPORT_FIREWALL_COMPLETION_READY',
      summary:
        'SuperSheet import execution firewall is ready for completion.',
      nextAction:
        'Proceed to SuperSheet import execution firewall completion ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'FIREWALL_COMPLETION_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_FIREWALL_COMPLETION_REVIEW_REQUIRED',
      summary:
        'Some closeout ledger records are firewall-completion-ready, but firewall completion requires review.',
      nextAction:
        'Review closeout ledger records before firewall completion ledger summary.'
    };
  }

  return {
    status: 'FIREWALL_COMPLETION_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_FIREWALL_COMPLETION_REVIEW_REQUIRED',
    summary:
      'No firewall-completion-ready SuperSheet import execution closeout ledger records were found.',
    nextAction:
      'Run upstream closeout ledger processor with firewall-completion-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3230_SuperSheetImportExecutionFirewallCompletionProcessor() {
  const result =
    sciipRun3230_SuperSheetImportExecutionFirewallCompletionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3230_SuperSheetImportExecutionFirewallCompletionProcessor',
    result: result
  }));

  return result;
}