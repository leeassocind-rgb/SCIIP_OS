/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 750_AutonomousOpsDigestProcessor
 *
 * COMMAND_CENTER_UPDATES → AUTONOMOUS_OPS_DIGESTS
 *
 * Migration note:
 * Preserves original 750 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousOpsDigestProcessorName750_() {
  return '750_AutonomousOpsDigestProcessor';
}

function sciipGetAutonomousOpsDigestsHeaders750_() {
  return [
    'Digest_ID',
    'Business_Key',
    'Digest_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Digest_Title',
    'Digest_Text',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousOpsDigestSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_OPS_DIGESTS',
    sciipGetAutonomousOpsDigestsHeaders750_()
  );
}

function sciipRunAutonomousOpsDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousOpsDigestProcessorName750_(),
    action: 'AUTONOMOUS_OPS_DIGEST_BUILD',
    sourceSheet: 'COMMAND_CENTER_UPDATES',
    targetSheet: 'AUTONOMOUS_OPS_DIGESTS',
    ledgerSheet: 'AUTONOMOUS_OPS_DIGESTS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const commandCenterUpdates = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('COMMAND_CENTER_UPDATES');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: commandCenterUpdates.length,
        outputCount: commandCenterUpdates.length ? 1 : 0,
        summary: 'Autonomous operations digest runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousOpsDigestProcessorName750_(),
          inputSheets: ['COMMAND_CENTER_UPDATES']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousOpsDigestSchema();
      const digestDate =
        sciipResolveLatestRuntimeProcessingDate750_('COMMAND_CENTER_UPDATES', 'Update_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousOpsDigestBusinessKey = 'AUTONOMOUS_OPS_DIGEST|' + digestDate;

      if (sciipRuntimeBusinessKeyPrefixExists750_(definition.targetSheet, autonomousOpsDigestBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousOpsDigestProcessorName750_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            commandCenterUpdatesReviewed: 0,
            autonomousOpsDigestsCreated: 0,
            skippedDuplicate: 1,
            autonomousOpsDigestBusinessKey: autonomousOpsDigestBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const commandCenterUpdates = sciipGetRuntimeRecordsByDate750_(
        'COMMAND_CENTER_UPDATES',
        'Update_Date',
        digestDate
      );

      if (commandCenterUpdates.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousOpsDigestProcessorName750_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            commandCenterUpdatesReviewed: 0,
            autonomousOpsDigestsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const digest = sciipCreateAutonomousOpsDigest750_({
        businessKey: autonomousOpsDigestBusinessKey,
        digestDate: digestDate,
        sourceRows: commandCenterUpdates,
        processor: sciipGetAutonomousOpsDigestProcessorName750_()
      });

      outputSheet.appendRow(digest);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousOpsDigestProcessorName750_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: commandCenterUpdates.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          commandCenterUpdatesReviewed: commandCenterUpdates.length,
          autonomousOpsDigestsCreated: 1,
          skippedDuplicate: 0,
          autonomousOpsDigestBusinessKey: autonomousOpsDigestBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists750_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate750_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue750_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate750_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue750_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue750_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipCreateAutonomousOpsDigest750_(args) {
  return [
    sciipGenerateId750_('AUTONOMOUS_OPS_DIGEST'),
    args.businessKey,
    args.digestDate,
    'COMMAND_CENTER_UPDATES',
    args.sourceRows.length,
    'Autonomous Operations Digest — ' + args.digestDate,
    sciipCreateAutonomousOpsDigestText750_(args.digestDate, args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousOpsDigestText750_(digestDate, sourceRows) {
  const lines = [];

  lines.push('Autonomous Operations Digest for ' + digestDate);
  lines.push('');
  lines.push('Source Records Reviewed: ' + sourceRows.length);
  lines.push('');

  sourceRows.forEach(function(row, index) {
    lines.push('Update ' + (index + 1) + ':');

    const preferredFields = [
      'Update_Title',
      'Update_Text',
      'Command_Update',
      'Summary',
      'Status',
      'Processor',
      'Business_Key'
    ];

    preferredFields.forEach(function(field) {
      if (row[field]) {
        lines.push(field + ': ' + row[field]);
      }
    });

    lines.push('');
  });

  return lines.join('\n').trim();
}

function sciipGenerateId750_(prefix) {
  const safePrefix = String(prefix || 'ID').toUpperCase();
  return safePrefix + '|' + Utilities.getUuid();
}

function sciipTestAutonomousOpsDigestProcessor() {
  const result = sciipRunAutonomousOpsDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousOpsDigestProcessor',
    result: result
  }));

  return result;
}
