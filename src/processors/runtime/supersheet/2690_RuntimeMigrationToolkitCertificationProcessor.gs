/**
 * SCIIP_OS v5.3.3
 * Runtime Migration Toolkit Certification Processor
 * File: 2690_RuntimeMigrationToolkitCertificationProcessor.gs
 *
 * Processor: 2690_RuntimeMigrationToolkitCertification
 *
 * Purpose:
 * Certifies the v5.3.3 Runtime Migration Toolkit as a safe,
 * review-only migration assistance framework.
 *
 * This processor does not execute generated code.
 * This processor does not modify source files.
 */

function sciipRun2690_RuntimeMigrationToolkitCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2690_RuntimeMigrationToolkitCertification',
    action: 'RUNTIME_MIGRATION_TOOLKIT_CERTIFICATION',
    sourceSheet: 'SCIIP_RUNTIME_MIGRATION_REPORT',
    targetSheet: 'SCIIP_RUNTIME_MIGRATION_TOOLKIT_CERTIFICATION',
    ledgerSheet: 'SCIIP_RUNTIME_MIGRATION_TOOLKIT_CERTIFICATION_LEDGER',

    buildPayload: function(context, definition) {
      var reportRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: reportRecords.length,
        outputCount: 1,
        summary: 'Runtime migration toolkit certification payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2680_RuntimeMigrationReport',
          toolkitVersion: 'v5.3.3',
          certifiedMode: 'REVIEW_ONLY',
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing migration report source sheet.');
      if (!definition.targetSheet) errors.push('Missing toolkit certification target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing toolkit certification ledger sheet.');

      var reportRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!reportRecords || reportRecords.length === 0) {
        errors.push('No runtime migration report records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var reportRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var latestReport =
        reportRecords && reportRecords.length
          ? reportRecords[reportRecords.length - 1]
          : null;

      var reportStatus = latestReport
        ? String(latestReport.Report_Status || '')
        : 'UNKNOWN';

      var codeExecutionAllowed = 'NO';
      var codeModificationAllowed = 'NO';
      var certifiedMode = 'REVIEW_ONLY';

      var certificationStatus = 'CERTIFIED';

      if (!latestReport) {
        certificationStatus = 'CERTIFIED_WITH_ATTENTION_REQUIRED';
      }

      var certificationStatement =
        'SCIIP_OS v5.3.3 Runtime Migration Toolkit is certified as a safe review-only migration assistance framework. It can analyze processor migration records, generate review-only skeleton records, validate parity-readiness metadata, and produce migration reports. It does not execute generated code and does not modify source files.';

      var certificationHeaders = [
        'Timestamp',
        'Toolkit_Version',
        'Processor',
        'Business_Key',
        'Certification_Status',
        'Certified_Mode',
        'Report_Status',
        'Code_Execution_Allowed',
        'Code_Modification_Allowed',
        'Certification_Statement',
        'Next_Phase',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Toolkit_Version',
        'Certification_Status',
        'Certified_Mode',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        certificationHeaders,
        {
          Timestamp: new Date(),
          Toolkit_Version: 'v5.3.3',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Certification_Status: certificationStatus,
          Certified_Mode: certifiedMode,
          Report_Status: reportStatus,
          Code_Execution_Allowed: codeExecutionAllowed,
          Code_Modification_Allowed: codeModificationAllowed,
          Certification_Statement: certificationStatement,
          Next_Phase: 'v5.3.4 Runtime Migration Candidate Expansion',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: reportRecords.length,
        processed: 1,
        message: JSON.stringify({
          runtimeMigrationToolkitCertificationStatus: certificationStatus,
          toolkitVersion: 'v5.3.3',
          certifiedMode: certifiedMode,
          reportStatus: reportStatus,
          codeExecutionAllowed: codeExecutionAllowed,
          codeModificationAllowed: codeModificationAllowed,
          transactionId: transaction.transactionId,
          nextPhase: 'v5.3.4 Runtime Migration Candidate Expansion'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'RUNTIME_MIGRATION_TOOLKIT_CERTIFICATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Toolkit_Version: 'v5.3.3',
          Certification_Status: certificationStatus,
          Certified_Mode: certifiedMode,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          certificationStatus: certificationStatus,
          certifiedMode: certifiedMode,
          reportStatus: reportStatus,
          codeExecutionAllowed: codeExecutionAllowed,
          codeModificationAllowed: codeModificationAllowed,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.3 runtime migration toolkit certification completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2690_RuntimeMigrationToolkitCertificationProcessor() {
  var result = sciipRun2690_RuntimeMigrationToolkitCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2690_RuntimeMigrationToolkitCertificationProcessor',
    result: result
  }));

  return result;
}