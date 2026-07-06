/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3270_SuperSheetImportExecutionProductionHandoffProcessor
 *******************************************************/

function sciipGet3270ProcessorName_() {
  return '3270_SuperSheetImportExecutionProductionHandoff';
}

function sciipGet3270SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet3270TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFFS';
}

function sciipGet3270Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFFS';
}

function sciipGet3270Headers_() {
  return [
    'Production_Handoff_ID',
    'Business_Key',
    'Production_Handoff_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Production_Handoff_Ready_Count',
    'Production_Handoff_Blocked_Count',
    'Review_Required_Count',
    'Production_Handoff_Status',
    'Production_Handoff_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3270TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3270TargetSheet_(),
    sciipGet3270Headers_()
  );
}

function sciipRun3270_SuperSheetImportExecutionProductionHandoffProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3270ProcessorName_(),
    action: sciipGet3270Action_(),
    sourceSheet: sciipGet3270SourceSheet_(),
    targetSheet: sciipGet3270TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_RUNTIME_LEDGER',

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
          'SuperSheet import execution production handoff runtime payload created.',
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
      const targetSheet = sciipEnsure3270TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3270ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionHandoffStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3260_SuperSheetImportExecutionFirewallFinalCertificationLedgerProcessor after 3250 creates final certification records.'
          })
        });
      }

      const handoffDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const handoffBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF|' + handoffDate;

      if (sciip3270BusinessKeyExists_(definition.targetSheet, handoffBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3270ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionHandoffStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            handoffBusinessKey: handoffBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3270CountProductionHandoffRecords_(sourceRecords);
      const posture = sciip3270ResolveProductionHandoffPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_' + Utilities.getUuid(),
        handoffBusinessKey,
        handoffDate,
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
        sciipGet3270ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3270ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionHandoffStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          productionHandoffReadyCount: counts.ready,
          productionHandoffBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          productionHandoffPosture: posture.posture,
          handoffBusinessKey: handoffBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3280_SuperSheetImportExecutionProductionHandoffLedgerProcessor'
        })
      });
    }
  });
}

function sciip3270BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3270CountProductionHandoffRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('FIREWALL_FINAL_CERTIFICATION_LEDGER_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_HANDOFF_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_HANDOFF_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_HANDOFF_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3270ResolveProductionHandoffPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_HANDOFF_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_HANDOFF_BLOCKED',
      summary:
        'SuperSheet import execution production handoff is blocked by final certification ledger conditions.',
      nextAction:
        'Review blocked final certification ledger records before production handoff ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_HANDOFF_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_HANDOFF_READY',
      summary:
        'SuperSheet import execution is ready for production handoff.',
      nextAction:
        'Proceed to SuperSheet import execution production handoff ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_HANDOFF_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_HANDOFF_REVIEW_REQUIRED',
      summary:
        'Some final certification ledger records are production-handoff-ready, but production handoff requires review.',
      nextAction:
        'Review final certification ledger records before production handoff ledger summary.'
    };
  }

  return {
    status: 'PRODUCTION_HANDOFF_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_PRODUCTION_HANDOFF_REVIEW_REQUIRED',
    summary:
      'No production-handoff-ready SuperSheet import execution final certification ledger records were found.',
    nextAction:
      'Run upstream final certification ledger processor with production-handoff-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3270_SuperSheetImportExecutionProductionHandoffProcessor() {
  const result =
    sciipRun3270_SuperSheetImportExecutionProductionHandoffProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3270_SuperSheetImportExecutionProductionHandoffProcessor',
    result: result
  }));

  return result;
}