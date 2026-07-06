/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3190_SuperSheetImportExecutionPostReconciliationCertificationProcessor
 *******************************************************/

function sciipGet3190ProcessorName_() {
  return '3190_SuperSheetImportExecutionPostReconciliationCertification';
}

function sciipGet3190SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_LEDGER_SUMMARY';
}

function sciipGet3190TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATIONS';
}

function sciipGet3190Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATIONS';
}

function sciipGet3190Headers_() {
  return [
    'Certification_ID',
    'Business_Key',
    'Certification_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certification_Ready_Count',
    'Certification_Blocked_Count',
    'Review_Required_Count',
    'Certification_Status',
    'Certification_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3190TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3190TargetSheet_(),
    sciipGet3190Headers_()
  );
}

function sciipRun3190_SuperSheetImportExecutionPostReconciliationCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3190ProcessorName_(),
    action: sciipGet3190Action_(),
    sourceSheet: sciipGet3190SourceSheet_(),
    targetSheet: sciipGet3190TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_RUNTIME_LEDGER',

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
          'SuperSheet import execution post-reconciliation certification runtime payload created.',
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
      const targetSheet = sciipEnsure3190TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3190ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            certificationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3180_SuperSheetImportExecutionReconciliationLedgerProcessor after 3170 creates reconciliation records.'
          })
        });
      }

      const certificationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const certificationBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION|' +
        certificationDate;

      if (sciip3190BusinessKeyExists_(definition.targetSheet, certificationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3190ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            certificationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            certificationBusinessKey: certificationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3190CountCertificationRecords_(sourceRecords);
      const posture = sciip3190ResolveCertificationPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_' +
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
        sciipGet3190ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3190ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          certificationStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          certificationReadyCount: counts.ready,
          certificationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          certificationPosture: posture.posture,
          certificationBusinessKey: certificationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3200_SuperSheetImportExecutionPostReconciliationCertificationLedgerProcessor'
        })
      });
    }
  });
}

function sciip3190BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3190CountCertificationRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('RECONCILIATION_LEDGER_READY') !== -1 ||
      statusText.indexOf('POST_RECONCILIATION_CERTIFICATION_READY') !== -1 ||
      statusText.indexOf('CERTIFICATION_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('CERTIFICATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3190ResolveCertificationPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'POST_RECONCILIATION_CERTIFICATION_BLOCKED',
      posture: 'POST_RECONCILIATION_CERTIFICATION_BLOCKED',
      summary:
        'SuperSheet import execution post-reconciliation certification is blocked by reconciliation ledger conditions.',
      nextAction:
        'Review blocked reconciliation ledger records before certification ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'POST_RECONCILIATION_CERTIFICATION_READY',
      posture: 'POST_RECONCILIATION_CERTIFICATION_READY',
      summary:
        'SuperSheet import execution reconciliation ledger is ready for post-reconciliation certification.',
      nextAction:
        'Proceed to post-reconciliation certification ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'POST_RECONCILIATION_CERTIFICATION_PARTIAL_READY',
      posture: 'POST_RECONCILIATION_CERTIFICATION_REVIEW_REQUIRED',
      summary:
        'Some reconciliation ledger records are certification-ready, but post-reconciliation certification requires review.',
      nextAction:
        'Review reconciliation ledger records before certification ledger summary.'
    };
  }

  return {
    status: 'POST_RECONCILIATION_CERTIFICATION_REVIEW_REQUIRED',
    posture: 'POST_RECONCILIATION_CERTIFICATION_REVIEW_REQUIRED',
    summary:
      'No certification-ready SuperSheet import execution reconciliation ledger records were found.',
    nextAction:
      'Run upstream reconciliation ledger processor with certification-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3190_SuperSheetImportExecutionPostReconciliationCertificationProcessor() {
  const result =
    sciipRun3190_SuperSheetImportExecutionPostReconciliationCertificationProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3190_SuperSheetImportExecutionPostReconciliationCertificationProcessor',
    result: result
  }));

  return result;
}