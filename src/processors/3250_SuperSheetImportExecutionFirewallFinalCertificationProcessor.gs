/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3250_SuperSheetImportExecutionFirewallFinalCertificationProcessor
 *******************************************************/

function sciipGet3250ProcessorName_() {
  return '3250_SuperSheetImportExecutionFirewallFinalCertification';
}

function sciipGet3250SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_COMPLETION_LEDGER_SUMMARY';
}

function sciipGet3250TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATIONS';
}

function sciipGet3250Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATIONS';
}

function sciipGet3250Headers_() {
  return [
    'Final_Certification_ID',
    'Business_Key',
    'Final_Certification_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Final_Certification_Ready_Count',
    'Final_Certification_Blocked_Count',
    'Review_Required_Count',
    'Final_Certification_Status',
    'Final_Certification_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3250TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3250TargetSheet_(),
    sciipGet3250Headers_()
  );
}

function sciipRun3250_SuperSheetImportExecutionFirewallFinalCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3250ProcessorName_(),
    action: sciipGet3250Action_(),
    sourceSheet: sciipGet3250SourceSheet_(),
    targetSheet: sciipGet3250TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_RUNTIME_LEDGER',

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
          'SuperSheet import execution firewall final certification runtime payload created.',
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
      const targetSheet = sciipEnsure3250TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3250ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            finalCertificationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3240_SuperSheetImportExecutionFirewallCompletionLedgerProcessor after 3230 creates firewall completion records.'
          })
        });
      }

      const certificationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const certificationBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION|' +
        certificationDate;

      if (sciip3250BusinessKeyExists_(definition.targetSheet, certificationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3250ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            finalCertificationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            certificationBusinessKey: certificationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3250CountFinalCertificationRecords_(sourceRecords);
      const posture = sciip3250ResolveFinalCertificationPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_FIREWALL_FINAL_CERTIFICATION_' +
          Utilities.getUuid(),
        certificationBusinessKey,
        certificationDate,
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
        sciipGet3250ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3250ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          finalCertificationStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          finalCertificationReadyCount: counts.ready,
          finalCertificationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          finalCertificationPosture: posture.posture,
          certificationBusinessKey: certificationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3260_SuperSheetImportExecutionFirewallFinalCertificationLedgerProcessor'
        })
      });
    }
  });
}

function sciip3250BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3250CountFinalCertificationRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('FIREWALL_COMPLETION_LEDGER_READY') !== -1 ||
      statusText.indexOf('FIREWALL_FINAL_CERTIFICATION_READY') !== -1 ||
      statusText.indexOf('FINAL_CERTIFICATION_READY') !== -1
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

function sciip3250ResolveFinalCertificationPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'FIREWALL_FINAL_CERTIFICATION_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_FIREWALL_FINAL_CERTIFICATION_BLOCKED',
      summary:
        'SuperSheet import execution firewall final certification is blocked by firewall completion ledger conditions.',
      nextAction:
        'Review blocked firewall completion ledger records before final certification ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'FIREWALL_FINAL_CERTIFICATION_READY',
      posture: 'SUPERSHEET_IMPORT_FIREWALL_FINAL_CERTIFICATION_READY',
      summary:
        'SuperSheet import execution firewall is ready for final certification.',
      nextAction:
        'Proceed to SuperSheet import execution firewall final certification ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'FIREWALL_FINAL_CERTIFICATION_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_FIREWALL_FINAL_CERTIFICATION_REVIEW_REQUIRED',
      summary:
        'Some firewall completion ledger records are final-certification-ready, but final certification requires review.',
      nextAction:
        'Review firewall completion ledger records before final certification ledger summary.'
    };
  }

  return {
    status: 'FIREWALL_FINAL_CERTIFICATION_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_FIREWALL_FINAL_CERTIFICATION_REVIEW_REQUIRED',
    summary:
      'No final-certification-ready SuperSheet import execution firewall completion ledger records were found.',
    nextAction:
      'Run upstream firewall completion ledger processor with final-certification-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3250_SuperSheetImportExecutionFirewallFinalCertificationProcessor() {
  const result =
    sciipRun3250_SuperSheetImportExecutionFirewallFinalCertificationProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3250_SuperSheetImportExecutionFirewallFinalCertificationProcessor',
    result: result
  }));

  return result;
}