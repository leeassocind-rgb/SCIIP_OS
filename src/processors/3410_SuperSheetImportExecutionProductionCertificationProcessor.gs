/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3410_SuperSheetImportExecutionProductionCertificationProcessor
 *******************************************************/

function sciipGet3410ProcessorName_() {
  return '3410_SuperSheetImportExecutionProductionCertification';
}

function sciipGet3410SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_LEDGER_SUMMARY';
}

function sciipGet3410TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATIONS';
}

function sciipGet3410Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATIONS';
}

function sciipGet3410Headers_() {
  return [
    'Production_Certification_ID',
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

function sciipEnsure3410TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3410TargetSheet_(),
    sciipGet3410Headers_()
  );
}

function sciipRun3410_SuperSheetImportExecutionProductionCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3410ProcessorName_(),
    action: sciipGet3410Action_(),
    sourceSheet: sciipGet3410SourceSheet_(),
    targetSheet: sciipGet3410TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION_RUNTIME_LEDGER',

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
          'SuperSheet import execution production certification runtime payload created.',
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
      const targetSheet = sciipEnsure3410TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3410ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionCertificationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3400_SuperSheetImportExecutionProductionTestResultLedgerProcessor after 3390 creates production test result records.'
          })
        });
      }

      const certificationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const certificationBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION|' +
        certificationDate;

      if (sciip3410BusinessKeyExists_(definition.targetSheet, certificationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3410ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionCertificationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            certificationBusinessKey: certificationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3410CountProductionCertificationRecords_(sourceRecords);
      const posture = sciip3410ResolveProductionCertificationPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_CERTIFICATION_' +
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
        sciipGet3410ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3410ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionCertificationStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          certificationReadyCount: counts.ready,
          certificationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          certificationPosture: posture.posture,
          certificationBusinessKey: certificationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3420_SuperSheetImportExecutionProductionCertificationLedgerProcessor'
        })
      });
    }
  });
}

function sciip3410BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3410CountProductionCertificationRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_RESULT_LEDGER_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_CERTIFICATION_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_CERTIFICATION_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_CERTIFICATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3410ResolveProductionCertificationPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_CERTIFICATION_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_CERTIFICATION_BLOCKED',
      summary:
        'SuperSheet import execution production certification is blocked by production test result ledger conditions.',
      nextAction:
        'Review blocked production test result ledger records before production certification ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_CERTIFICATION_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_CERTIFICATION_READY',
      summary:
        'SuperSheet import execution production certification is ready.',
      nextAction:
        'Proceed to SuperSheet import execution production certification ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_CERTIFICATION_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_CERTIFICATION_REVIEW_REQUIRED',
      summary:
        'Some production test result ledger records are certification-ready, but production certification requires review.',
      nextAction:
        'Review production test result ledger records before production certification ledger summary.'
    };
  }

  return {
    status: 'PRODUCTION_CERTIFICATION_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_PRODUCTION_CERTIFICATION_REVIEW_REQUIRED',
    summary:
      'No production-certification-ready SuperSheet import execution test result ledger records were found.',
    nextAction:
      'Run upstream production test result ledger processor with certification-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3410_SuperSheetImportExecutionProductionCertificationProcessor() {
  const result =
    sciipRun3410_SuperSheetImportExecutionProductionCertificationProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3410_SuperSheetImportExecutionProductionCertificationProcessor',
    result: result
  }));

  return result;
}