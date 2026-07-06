/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3260_SuperSheetImportExecutionFirewallFinalCertificationLedgerProcessor
 *******************************************************/

function sciipGet3260ProcessorName_() {
  return '3260_SuperSheetImportExecutionFirewallFinalCertificationLedger';
}

function sciipGet3260SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATIONS';
}

function sciipGet3260TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet3260Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet3260Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Final_Certification_Ready_Count',
    'Final_Certification_Blocked_Count',
    'Review_Required_Count',
    'Final_Certification_Ledger_Status',
    'Final_Certification_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3260TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3260TargetSheet_(),
    sciipGet3260Headers_()
  );
}

function sciipRun3260_SuperSheetImportExecutionFirewallFinalCertificationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3260ProcessorName_(),
    action: sciipGet3260Action_(),
    sourceSheet: sciipGet3260SourceSheet_(),
    targetSheet: sciipGet3260TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_LEDGER_RUNTIME_LEDGER',

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
          'SuperSheet import execution firewall final certification ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3260TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3260ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            finalCertificationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3250_SuperSheetImportExecutionFirewallFinalCertificationProcessor after 3240 creates firewall completion ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_LEDGER|' +
        ledgerDate;

      if (sciip3260BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3260ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            finalCertificationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3260CountFinalCertificationLedgerRecords_(sourceRecords);
      const posture = sciip3260ResolveFinalCertificationLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_LEDGER_' +
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
        sciipGet3260ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3260ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          finalCertificationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          finalCertificationReadyCount: counts.ready,
          finalCertificationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          finalCertificationLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3270_SuperSheetImportExecutionProductionHandoffProcessor'
        })
      });
    }
  });
}

function sciip3260BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3260CountFinalCertificationLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('FIREWALL_FINAL_CERTIFICATION_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_FIREWALL_FINAL_CERTIFICATION_READY') !== -1 ||
      statusText.indexOf('FINAL_CERTIFICATION_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('FINAL_CERTIFICATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3260ResolveFinalCertificationLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'FIREWALL_FINAL_CERTIFICATION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'PRODUCTION_HANDOFF_BLOCKED',
      summary:
        'SuperSheet import execution firewall final certification ledger recorded blocking conditions.',
      nextAction:
        'Review blocked final certification records before production handoff.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'FIREWALL_FINAL_CERTIFICATION_LEDGER_READY',
      posture: 'PRODUCTION_HANDOFF_READY',
      summary:
        'All SuperSheet import execution firewall final certification records are ready for production handoff.',
      nextAction:
        'Proceed to SuperSheet import execution production handoff.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'FIREWALL_FINAL_CERTIFICATION_LEDGER_PARTIAL_READY',
      posture: 'PRODUCTION_HANDOFF_REVIEW_REQUIRED',
      summary:
        'Some final certification records are ready, but production handoff requires review.',
      nextAction:
        'Review final certification records before production handoff.'
    };
  }

  return {
    status: 'FIREWALL_FINAL_CERTIFICATION_LEDGER_REVIEW_REQUIRED',
    posture: 'PRODUCTION_HANDOFF_REVIEW_REQUIRED',
    summary:
      'No production-handoff-ready SuperSheet import execution final certification records were found.',
    nextAction:
      'Run upstream final certification processor with final-certification-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3260_SuperSheetImportExecutionFirewallFinalCertificationLedgerProcessor() {
  const result =
    sciipRun3260_SuperSheetImportExecutionFirewallFinalCertificationLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3260_SuperSheetImportExecutionFirewallFinalCertificationLedgerProcessor',
    result: result
  }));

  return result;
}