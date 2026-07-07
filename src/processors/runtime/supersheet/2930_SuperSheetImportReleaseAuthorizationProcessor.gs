/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2930_SuperSheetImportReleaseAuthorizationProcessor
 *******************************************************/

function sciipGet2930ProcessorName_() {
  return '2930_SuperSheetImportReleaseAuthorization';
}

function sciipGet2930SourceSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_GATE_LEDGER_SUMMARY';
}

function sciipGet2930TargetSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATIONS';
}

function sciipGet2930Action_() {
  return 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION';
}

function sciipGet2930Headers_() {
  return [
    'Release_Authorization_ID',
    'Business_Key',
    'Authorization_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Release_Authorization_Status',
    'Authorization_Posture',
    'Authorization_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2930TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2930TargetSheet_(),
    sciipGet2930Headers_()
  );
}

function sciipRun2930_SuperSheetImportReleaseAuthorizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2930ProcessorName_(),
    action: sciipGet2930Action_(),
    sourceSheet: sciipGet2930SourceSheet_(),
    targetSheet: sciipGet2930TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import release authorization runtime payload created.',
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
      const targetSheet = sciipEnsure2930TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2930ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            releaseAuthorizationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2920_SuperSheetImportReleaseGateLedgerProcessor after 2910 creates release gate records.'
          })
        });
      }

      const authorizationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const authorizationBusinessKey = 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION|' + authorizationDate;

      if (sciip2930BusinessKeyExists_(definition.targetSheet, authorizationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2930ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            releaseAuthorizationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            authorizationBusinessKey: authorizationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const authorization = sciip2930ResolveAuthorization_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_' + Utilities.getUuid(),
        authorizationBusinessKey,
        authorizationDate,
        definition.sourceSheet,
        sourceRecords.length,
        authorization.status,
        authorization.posture,
        authorization.decision,
        authorization.blockingReason,
        authorization.summary,
        authorization.nextAction,
        new Date().toISOString(),
        sciipGet2930ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2930ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          releaseAuthorizationStatus: authorization.status,
          authorizationPosture: authorization.posture,
          authorizationDecision: authorization.decision,
          blockingReason: authorization.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          authorizationBusinessKey: authorizationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2940_SuperSheetImportReleaseAuthorizationLedgerProcessor'
        })
      });
    }
  });
}

function sciip2930BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2930ResolveAuthorization_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('RELEASE_GATE_LEDGER_OPEN') !== -1 &&
    statusText.indexOf('IMPORT_RELEASE_READY') !== -1
  ) {
    return {
      status: 'RELEASE_AUTHORIZED',
      posture: 'IMPORT_RELEASE_AUTHORIZED',
      decision: 'AUTHORIZED',
      blockingReason: '',
      summary: 'SuperSheet import release is authorized based on open release gate ledger posture.',
      nextAction: 'Proceed to release authorization ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_RELEASE_BLOCKED') !== -1
  ) {
    return {
      status: 'RELEASE_AUTHORIZATION_BLOCKED',
      posture: 'IMPORT_RELEASE_BLOCKED',
      decision: 'NOT_AUTHORIZED',
      blockingReason: 'Release gate ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import release authorization is blocked.',
      nextAction: 'Review release gate ledger blockers before authorization.'
    };
  }

  return {
    status: 'RELEASE_AUTHORIZATION_REVIEW_REQUIRED',
    posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Release gate ledger did not produce a fully open release posture.',
    summary: 'SuperSheet import release authorization requires review.',
    nextAction: 'Review release gate ledger summary before authorizing release.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2930_SuperSheetImportReleaseAuthorizationProcessor() {
  const result = sciipRun2930_SuperSheetImportReleaseAuthorizationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2930_SuperSheetImportReleaseAuthorizationProcessor',
    result: result
  }));

  return result;
}