/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2910_SuperSheetImportReleaseGateProcessor
 *******************************************************/

function sciipGet2910ProcessorName_() {
  return '2910_SuperSheetImportReleaseGate';
}

function sciipGet2910SourceSheet_() {
  return 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet2910TargetSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_GATE';
}

function sciipGet2910Action_() {
  return 'SUPERSHEET_IMPORT_RELEASE_GATE';
}

function sciipGet2910Headers_() {
  return [
    'Release_Gate_ID',
    'Business_Key',
    'Gate_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Release_Gate_Status',
    'Release_Posture',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2910TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2910TargetSheet_(),
    sciipGet2910Headers_()
  );
}

function sciipRun2910_SuperSheetImportReleaseGateProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2910ProcessorName_(),
    action: sciipGet2910Action_(),
    sourceSheet: sciipGet2910SourceSheet_(),
    targetSheet: sciipGet2910TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_RELEASE_GATE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import release gate runtime payload created.',
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
      const targetSheet = sciipEnsure2910TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2910ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            releaseGateStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2900_SuperSheetImportSystemCertificationLedgerProcessor after 2890 creates system certification records.'
          })
        });
      }

      const gateDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const gateBusinessKey = 'SUPERSHEET_IMPORT_RELEASE_GATE|' + gateDate;

      if (sciip2910BusinessKeyExists_(definition.targetSheet, gateBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2910ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            releaseGateStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            gateBusinessKey: gateBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const posture = sciip2910ResolveReleaseGatePosture_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_RELEASE_GATE_' + Utilities.getUuid(),
        gateBusinessKey,
        gateDate,
        definition.sourceSheet,
        sourceRecords.length,
        posture.status,
        posture.posture,
        posture.blockingReason,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet2910ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2910ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          releaseGateStatus: posture.status,
          releasePosture: posture.posture,
          blockingReason: posture.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          gateBusinessKey: gateBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2920_SuperSheetImportReleaseGateLedgerProcessor'
        })
      });
    }
  });
}

function sciip2910BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2910ResolveReleaseGatePosture_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('SYSTEM_CERTIFICATION_LEDGER_CERTIFIED') !== -1 ||
    statusText.indexOf('IMPORT_READY') !== -1
  ) {
    return {
      status: 'RELEASE_GATE_OPEN',
      posture: 'IMPORT_RELEASE_READY',
      blockingReason: '',
      summary: 'SuperSheet import system certification ledger is certified and ready for release.',
      nextAction: 'Proceed to release gate ledger summary.'
    };
  }

  if (
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('IMPORT_NOT_READY') !== -1
  ) {
    return {
      status: 'RELEASE_GATE_BLOCKED',
      posture: 'IMPORT_RELEASE_BLOCKED',
      blockingReason: 'System certification ledger indicates failed or blocking conditions.',
      summary: 'SuperSheet import release is blocked pending review.',
      nextAction: 'Review upstream certification failures before release.'
    };
  }

  return {
    status: 'RELEASE_GATE_REVIEW_REQUIRED',
    posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
    blockingReason: 'System certification ledger did not produce a fully certified release posture.',
    summary: 'SuperSheet import release requires review before proceeding.',
    nextAction: 'Review system certification ledger summary before release.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2910_SuperSheetImportReleaseGateProcessor() {
  const result = sciipRun2910_SuperSheetImportReleaseGateProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2910_SuperSheetImportReleaseGateProcessor',
    result: result
  }));

  return result;
}