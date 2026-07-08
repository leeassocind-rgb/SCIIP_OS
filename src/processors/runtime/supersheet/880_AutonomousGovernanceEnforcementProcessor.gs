/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 880_AutonomousGovernanceEnforcementProcessor
 *
 * AUTONOMOUS_GOVERNANCE_AUDITS → AUTONOMOUS_GOVERNANCE_ENFORCEMENTS
 *
 * Migration note:
 * Preserves original 880 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousGovernanceEnforcementProcessorName880_() {
  return '880_AutonomousGovernanceEnforcementProcessor';
}

function sciipGetAutonomousGovernanceEnforcementHeaders880_() {
  return ['Enforcement_ID',
    'Business_Key',
    'Enforcement_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Enforcement_Title',
    'Enforcement_Type',
    'Enforcement_Rule',
    'Enforcement_Scope',
    'Validation_Checklist',
    'Enforcement_Status',
    'Created_At',
    'Processor'];
}

function sciipEnsureAutonomousGovernanceEnforcementSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_GOVERNANCE_ENFORCEMENTS',
    sciipGetAutonomousGovernanceEnforcementHeaders880_()
  );
}

function sciipRunAutonomousGovernanceEnforcementProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousGovernanceEnforcementProcessorName880_(),
    action: 'AUTONOMOUS_GOVERNANCE_ENFORCEMENT_BUILD',
    sourceSheet: 'AUTONOMOUS_GOVERNANCE_AUDITS',
    targetSheet: 'AUTONOMOUS_GOVERNANCE_ENFORCEMENTS',
    ledgerSheet: 'AUTONOMOUS_GOVERNANCE_ENFORCEMENTS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousGovernanceAudits = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_GOVERNANCE_AUDITS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousGovernanceAudits.length,
        outputCount: autonomousGovernanceAudits.length ? 1 : 0,
        summary: 'Autonomous governance enforcement runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousGovernanceEnforcementProcessorName880_(),
          inputSheets: ['AUTONOMOUS_GOVERNANCE_AUDITS']
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
      const outputSheet = sciipEnsureAutonomousGovernanceEnforcementSchema();
      const enforcementDate =
        sciipResolveLatestRuntimeProcessingDate880_('AUTONOMOUS_GOVERNANCE_AUDITS', 'Audit_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousGovernanceEnforcementBusinessKey = 'AUTONOMOUS_GOVERNANCE_ENFORCEMENT|' + enforcementDate;

      if (sciipRuntimeBusinessKeyPrefixExists880_(definition.targetSheet, autonomousGovernanceEnforcementBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousGovernanceEnforcementProcessorName880_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousGovernanceAuditsReviewed: 0,
            autonomousGovernanceEnforcementsCreated: 0,
            skippedDuplicate: 1,
            autonomousGovernanceEnforcementBusinessKey: autonomousGovernanceEnforcementBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousGovernanceAudits = sciipGetRuntimeRecordsByDate880_(
        'AUTONOMOUS_GOVERNANCE_AUDITS',
        'Audit_Date',
        enforcementDate
      );

      if (!autonomousGovernanceAudits.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousGovernanceEnforcementProcessorName880_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousGovernanceAuditsReviewed: 0,
            autonomousGovernanceEnforcementsCreated: 0,
            skippedNoInputs: 1,
            enforcementDate: enforcementDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const outputRecord = sciipBuildAutonomousGovernanceEnforcement880_({
        enforcementDate: enforcementDate,
        businessKey: autonomousGovernanceEnforcementBusinessKey,
        sourceRows: autonomousGovernanceAudits,
        startedAt: new Date()
      });

      outputSheet.appendRow(sciipGetAutonomousGovernanceEnforcementHeaders880_().map(function(header) {
        return outputRecord[header] || '';
      }));

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousGovernanceEnforcementProcessorName880_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousGovernanceAudits.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousGovernanceAuditsReviewed: autonomousGovernanceAudits.length,
          autonomousGovernanceEnforcementsCreated: 1,
          skippedDuplicate: 0,
          autonomousGovernanceEnforcementBusinessKey: autonomousGovernanceEnforcementBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists880_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate880_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue880_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate880_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue880_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue880_(value) {
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

function sciipBuildAutonomousGovernanceEnforcement880_(payload) {
  const enforcementId = `AUTONOMOUS_GOVERNANCE_ENFORCEMENT_${Utilities.getUuid()}`;

  return {
    Enforcement_ID: enforcementId,
    Business_Key: payload.businessKey,
    Enforcement_Date: payload.enforcementDate,
    Source_Sheet: 'AUTONOMOUS_GOVERNANCE_AUDITS',
    Source_Record_Count: payload.sourceRows.length,
    Enforcement_Title: `Autonomous Governance Enforcement — ${payload.enforcementDate}`,
    Enforcement_Type: 'PROCESSOR_BUILD_STANDARD_ENFORCEMENT',
    Enforcement_Rule: sciipCreateAutonomousGovernanceEnforcementRule880_(payload.sourceRows),
    Enforcement_Scope: sciipCreateAutonomousGovernanceEnforcementScope880_(payload.sourceRows),
    Validation_Checklist: sciipCreateAutonomousGovernanceValidationChecklist880_(payload.sourceRows),
    Enforcement_Status: 'ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: sciipGetAutonomousGovernanceEnforcementProcessorName880_()
  };
}

function sciipCreateAutonomousGovernanceEnforcementRule880_(sourceRows) {
  return [
    'Every downstream SCIIP_OS processor that consumes prior processor output must resolve its processing date from the latest completed upstream batch.',
    'The resolved date must be used for both business-key generation and source-row filtering.',
    'Processors may only fall back to the current execution date when no upstream date exists.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceEnforcementScope880_(sourceRows) {
  return [
    'Applies to all future autonomous processors.',
    'Applies to existing downstream processors during refactor or bug fix review.',
    'Applies to all batch-oriented processors that depend on upstream output sheets.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceValidationChecklist880_(sourceRows) {
  return [
    '1. Identify the processor input sheet.',
    '2. Identify the upstream processing date column.',
    '3. Resolve date using sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN).',
    '4. Use the resolved date in the business key.',
    '5. Use the resolved date in source-row filtering.',
    '6. Use sciipBusinessKeyPrefixExists_() for batch-oriented duplicate protection.',
    '7. Log resolved date and business key during test execution.',
    '8. Validate first run creates one record.',
    '9. Validate second run skips duplicate with skippedDuplicate: 1.'
  ].join('\n');
}

function sciipGenerateId880_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousGovernanceEnforcementProcessor() {
  const result = sciipRunAutonomousGovernanceEnforcementProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousGovernanceEnforcementProcessor',
    result: result
  }));

  return result;
}
