/*******************************************************
 * 2910_SuperSheetImportReleaseReadinessProcessor
 * SCIIP_OS v5.4 — SuperSheet Intake Firewall
 *******************************************************/

class SuperSheetImportReleaseReadinessProcessor extends SCIIP_RuntimeProcessorBase {
  constructor() {
    super({
      processorId: '2910',
      processorName: '2910_SuperSheetImportReleaseReadinessProcessor',
      sourceSheetName: 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER_SUMMARY',
      targetSheetName: 'SUPERSHEET_IMPORT_RELEASE_READINESS',
      businessKeyPrefix: 'SUPERSHEET_IMPORT_RELEASE_READINESS',
      requiredHeaders: [
        'business_key',
        'readiness_date',
        'release_readiness_status',
        'system_certification_status',
        'source_sheet',
        'target_sheet',
        'transaction_id',
        'runtime_payload',
        'created_at'
      ]
    });
  }

  process() {
    const transaction = this.createTransaction();
    const now = new Date();
    const readinessDate = SCIIP_DateUtilities.formatDateKey(now);

    const sourceSheet = SCIIP_SheetUtilities.getOrCreateSheet(
      this.sourceSheetName,
      [
        'business_key',
        'certification_date',
        'import_system_certification_status',
        'source_sheet',
        'target_sheet',
        'transaction_id',
        'runtime_payload',
        'created_at'
      ]
    );

    const targetSheet = SCIIP_SheetUtilities.getOrCreateSheet(
      this.targetSheetName,
      this.requiredHeaders
    );

    const sourceRows = SCIIP_SheetUtilities.getDataRows(sourceSheet);

    if (!sourceRows || sourceRows.length === 0) {
      return this.runtimeResult({
        processor: this.processorName,
        status: 'SKIPPED_NO_INPUTS',
        businessKey: `${this.businessKeyPrefix}|${readinessDate}`,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsRead: 0,
        processed: 0,
        skippedDuplicate: 0,
        skippedNoInputs: 1,
        skippedValidation: 0,
        errors: 0,
        message: JSON.stringify({
          releaseReadinessStatus: 'SKIPPED_NO_INPUTS',
          sourceSheet: this.sourceSheetName,
          targetSheet: this.targetSheetName,
          nextAction: 'Run after 2890 and 2900 once SuperSheet import system certification records exist.'
        })
      });
    }

    const latestCertification = sourceRows[sourceRows.length - 1];
    const systemCertificationStatus =
      latestCertification.import_system_certification_status ||
      latestCertification.system_certification_status ||
      'UNKNOWN';

    const readinessStatus =
      systemCertificationStatus === 'CERTIFIED'
        ? 'READY_FOR_RELEASE'
        : 'NOT_READY_FOR_RELEASE';

    const businessKey = `${this.businessKeyPrefix}|${readinessDate}`;

    if (SCIIP_BusinessKeyUtilities.businessKeyExists(targetSheet, businessKey)) {
      return this.runtimeResult({
        processor: this.processorName,
        status: 'SUCCESS',
        businessKey,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsRead: sourceRows.length,
        processed: 0,
        skippedDuplicate: 1,
        skippedNoInputs: 0,
        skippedValidation: 0,
        errors: 0,
        message: JSON.stringify({
          releaseReadinessStatus: readinessStatus,
          skippedDuplicate: true,
          sourceSheet: this.sourceSheetName,
          targetSheet: this.targetSheetName
        })
      });
    }

    const runtimePayload = {
      processor: this.processorName,
      readinessDate,
      releaseReadinessStatus: readinessStatus,
      systemCertificationStatus,
      sourceSheet: this.sourceSheetName,
      targetSheet: this.targetSheetName,
      transactionId: transaction.transactionId,
      nextAction:
        readinessStatus === 'READY_FOR_RELEASE'
          ? 'Proceed to SuperSheet import release authorization.'
          : 'Hold release until system certification is CERTIFIED.'
    };

    SCIIP_SheetUtilities.appendObjectRow(targetSheet, {
      business_key: businessKey,
      readiness_date: readinessDate,
      release_readiness_status: readinessStatus,
      system_certification_status: systemCertificationStatus,
      source_sheet: this.sourceSheetName,
      target_sheet: this.targetSheetName,
      transaction_id: transaction.transactionId,
      runtime_payload: JSON.stringify(runtimePayload),
      created_at: now.toISOString()
    });

    return this.runtimeResult({
      processor: this.processorName,
      status: 'SUCCESS',
      businessKey,
      recordsCreated: 1,
      recordsUpdated: 0,
      recordsRead: sourceRows.length,
      processed: 1,
      skippedDuplicate: 0,
      skippedNoInputs: 0,
      skippedValidation: readinessStatus === 'READY_FOR_RELEASE' ? 0 : 1,
      errors: 0,
      message: JSON.stringify(runtimePayload)
    });
  }
}

/*******************************************************
 * Entry Point
 *******************************************************/

function run2910_SuperSheetImportReleaseReadinessProcessor() {
  const processor = new SuperSheetImportReleaseReadinessProcessor();
  return processor.process();
}

/*******************************************************
 * Standalone Test
 *******************************************************/

function sciipTest2910_SuperSheetImportReleaseReadinessProcessor() {
  const result = run2910_SuperSheetImportReleaseReadinessProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2910_SuperSheetImportReleaseReadinessProcessor',
    result
  }));

  return result;
}