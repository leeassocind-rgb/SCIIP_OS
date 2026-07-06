/*******************************************************
 * SCIIP_OS Runtime Processor
 * 2890_SuperSheetImportSystemCertificationProcessor
 *
 * SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_SUMMARY
 *   → SUPERSHEET_IMPORT_SYSTEM_CERTIFICATIONS
 *
 * Purpose:
 * Creates a system-level certification record for the
 * SuperSheet import firewall after final certification
 * ledger summaries exist.
 *
 * Runtime pattern:
 * - SCIIP_RuntimeProcessorBase
 * - Skip-safe when upstream records do not exist
 * - Duplicate-safe through shared runtime framework
 * - No destructive updates
 *******************************************************/

function sciipRun2890_SuperSheetImportSystemCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2890_SuperSheetImportSystemCertification',
    action: 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_BUILD',
    sourceSheet: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATIONS',
    ledgerSheet: 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: records.length,
        outputCount: records.length ? 1 : 0,
        summary: 'SuperSheet import system certification payload created.',
        refs: {
          migrationVersion: 'v5.4.0',
          subsystem: 'SUPERSHEET_IMPORT_FIREWALL',
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet
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
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);
      const targetSheet = sciipEnsure2890_SuperSheetImportSystemCertificationSheet_();

      if (!sourceRecords || sourceRecords.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importSystemCertificationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2880_SuperSheetImportFinalCertificationLedgerProcessor after 2870 creates final certification records.'
          })
        });
      }

      const latest = sourceRecords[sourceRecords.length - 1] || {};
      const certificationDate = SCIIP_RUNTIME.getDateKey({});
      const certificationKey = 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION|' + certificationDate;

      if (sciip2890_BusinessKeyExists_(definition.targetSheet, certificationKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importSystemCertificationStatus: 'DUPLICATE_SKIPPED',
            importSystemCertificationBusinessKey: certificationKey,
            sourceRecordsReviewed: sourceRecords.length,
            transactionId: transaction.transactionId
          })
        });
      }

      const finalStatus = String(
        latest.Final_Certification_Status ||
        latest.Certification_Status ||
        latest.Status ||
        latest.importFinalCertificationStatus ||
        ''
      ).trim().toUpperCase();

      const systemStatus = sciip2890_ResolveSystemCertificationStatus_(finalStatus, sourceRecords.length);
      const posture = sciip2890_ResolveSystemPosture_(systemStatus);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_' + Utilities.getUuid(),
        certificationKey,
        certificationDate,
        definition.sourceSheet,
        sourceRecords.length,
        systemStatus,
        posture,
        sciip2890_CreateSystemCertificationSummary_(systemStatus, sourceRecords.length),
        sciip2890_CreateSystemCertificationDecision_(systemStatus),
        sciip2890_CreateSystemCertificationNextAction_(systemStatus),
        transaction.transactionId,
        new Date().toISOString(),
        context.processor
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          importSystemCertificationStatus: systemStatus,
          systemPosture: posture,
          sourceRecordsReviewed: sourceRecords.length,
          importSystemCertificationBusinessKey: certificationKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2900_SuperSheetImportSystemCertificationLedgerProcessor'
        })
      });
    }
  });
}

function sciipEnsure2890_SuperSheetImportSystemCertificationSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATIONS',
    [
      'System_Certification_ID',
      'Business_Key',
      'Certification_Date',
      'Source_Sheet',
      'Source_Record_Count',
      'System_Certification_Status',
      'System_Posture',
      'Certification_Summary',
      'Certification_Decision',
      'Next_Action',
      'Transaction_ID',
      'Created_At',
      'Processor'
    ]
  );
}

function sciip2890_BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;

  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey || key.indexOf(businessKey + '|') === 0;
  });
}

function sciip2890_ResolveSystemCertificationStatus_(finalStatus, count) {
  if (!count) return 'NOT_CERTIFIED';
  if (finalStatus.indexOf('CERTIFIED') !== -1 || finalStatus.indexOf('PASS') !== -1) {
    return 'CERTIFIED';
  }
  if (finalStatus.indexOf('FAILED') !== -1 || finalStatus.indexOf('BLOCK') !== -1) {
    return 'NOT_CERTIFIED';
  }
  return 'REVIEW_REQUIRED';
}

function sciip2890_ResolveSystemPosture_(status) {
  if (status === 'CERTIFIED') return 'READY_FOR_CONTROLLED_SUPERSHEET_IMPORT';
  if (status === 'NOT_CERTIFIED') return 'IMPORT_BLOCKED';
  return 'IMPORT_REVIEW_REQUIRED';
}

function sciip2890_CreateSystemCertificationSummary_(status, count) {
  return [
    'SCIIP_OS reviewed ' + count + ' SuperSheet import final certification ledger summary record(s).',
    'System certification status: ' + status + '.',
    'This certification governs whether SuperSheet import may proceed into controlled production intake.'
  ].join(' ');
}

function sciip2890_CreateSystemCertificationDecision_(status) {
  if (status === 'CERTIFIED') return 'ALLOW_CONTROLLED_IMPORT';
  if (status === 'NOT_CERTIFIED') return 'BLOCK_IMPORT';
  return 'REQUIRE_OPERATOR_REVIEW';
}

function sciip2890_CreateSystemCertificationNextAction_(status) {
  if (status === 'CERTIFIED') {
    return 'Proceed to controlled SuperSheet import pilot and monitor downstream data quality, promotion gate, and match outcomes.';
  }
  if (status === 'NOT_CERTIFIED') {
    return 'Do not import SuperSheets. Review final certification failures and rerun the SuperSheet import firewall chain.';
  }
  return 'Review SuperSheet final certification ledger summaries before allowing import into matching and promotion workflows.';
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2890_SuperSheetImportSystemCertificationProcessor() {
  const result = sciipRun2890_SuperSheetImportSystemCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2890_SuperSheetImportSystemCertificationProcessor',
    result: result
  }));

  return result;
}
