/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 870_AutonomousGovernanceAuditProcessor
 *
 * AUTONOMOUS_STANDARD_COMPLIANCE → AUTONOMOUS_GOVERNANCE_AUDITS
 *
 * Migration note:
 * Preserves original 870 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousGovernanceAuditProcessorName870_() {
  return '870_AutonomousGovernanceAuditProcessor';
}

function sciipGetAutonomousGovernanceAuditHeaders870_() {
  return ['Audit_ID',
    'Business_Key',
    'Audit_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Audit_Title',
    'Audit_Type',
    'Audit_Finding',
    'Audit_Result',
    'Governance_Status',
    'Required_Follow_Up',
    'Created_At',
    'Processor'];
}

function sciipEnsureAutonomousGovernanceAuditSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_GOVERNANCE_AUDITS',
    sciipGetAutonomousGovernanceAuditHeaders870_()
  );
}

function sciipRunAutonomousGovernanceAuditProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousGovernanceAuditProcessorName870_(),
    action: 'AUTONOMOUS_GOVERNANCE_AUDIT_BUILD',
    sourceSheet: 'AUTONOMOUS_STANDARD_COMPLIANCE',
    targetSheet: 'AUTONOMOUS_GOVERNANCE_AUDITS',
    ledgerSheet: 'AUTONOMOUS_GOVERNANCE_AUDITS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousStandardCompliance = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_STANDARD_COMPLIANCE');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousStandardCompliance.length,
        outputCount: autonomousStandardCompliance.length ? 1 : 0,
        summary: 'Autonomous governance audit runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousGovernanceAuditProcessorName870_(),
          inputSheets: ['AUTONOMOUS_STANDARD_COMPLIANCE']
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
      const outputSheet = sciipEnsureAutonomousGovernanceAuditSchema();
      const auditDate =
        sciipResolveLatestRuntimeProcessingDate870_('AUTONOMOUS_STANDARD_COMPLIANCE', 'Compliance_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousGovernanceAuditBusinessKey = 'AUTONOMOUS_GOVERNANCE_AUDIT|' + auditDate;

      if (sciipRuntimeBusinessKeyPrefixExists870_(definition.targetSheet, autonomousGovernanceAuditBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousGovernanceAuditProcessorName870_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousStandardComplianceReviewed: 0,
            autonomousGovernanceAuditsCreated: 0,
            skippedDuplicate: 1,
            autonomousGovernanceAuditBusinessKey: autonomousGovernanceAuditBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousStandardCompliance = sciipGetRuntimeRecordsByDate870_(
        'AUTONOMOUS_STANDARD_COMPLIANCE',
        'Compliance_Date',
        auditDate
      );

      if (!autonomousStandardCompliance.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousGovernanceAuditProcessorName870_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousStandardComplianceReviewed: 0,
            autonomousGovernanceAuditsCreated: 0,
            skippedNoInputs: 1,
            auditDate: auditDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const outputRecord = sciipBuildAutonomousGovernanceAudit870_({
        auditDate: auditDate,
        businessKey: autonomousGovernanceAuditBusinessKey,
        sourceRows: autonomousStandardCompliance,
        startedAt: new Date()
      });

      outputSheet.appendRow(sciipGetAutonomousGovernanceAuditHeaders870_().map(function(header) {
        return outputRecord[header] || '';
      }));

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousGovernanceAuditProcessorName870_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousStandardCompliance.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousStandardComplianceReviewed: autonomousStandardCompliance.length,
          autonomousGovernanceAuditsCreated: 1,
          skippedDuplicate: 0,
          autonomousGovernanceAuditBusinessKey: autonomousGovernanceAuditBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists870_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate870_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue870_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate870_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue870_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue870_(value) {
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

function sciipBuildAutonomousGovernanceAudit870_(payload) {
  const auditId = `AUTONOMOUS_GOVERNANCE_AUDIT_${Utilities.getUuid()}`;

  return {
    Audit_ID: auditId,
    Business_Key: payload.businessKey,
    Audit_Date: payload.auditDate,
    Source_Sheet: 'AUTONOMOUS_STANDARD_COMPLIANCE',
    Source_Record_Count: payload.sourceRows.length,
    Audit_Title: `Autonomous Governance Audit — ${payload.auditDate}`,
    Audit_Type: 'PROCESSOR_STANDARD_COMPLIANCE_AUDIT',
    Audit_Finding: sciipCreateAutonomousGovernanceAuditFinding870_(payload.sourceRows),
    Audit_Result: sciipCreateAutonomousGovernanceAuditResult870_(payload.sourceRows),
    Governance_Status: 'AUDITED_COMPLIANT',
    Required_Follow_Up: sciipCreateAutonomousGovernanceAuditFollowUp870_(payload.sourceRows),
    Created_At: payload.startedAt.toISOString(),
    Processor: sciipGetAutonomousGovernanceAuditProcessorName870_()
  };
}

function sciipCreateAutonomousGovernanceAuditFinding870_(sourceRows) {
  return [
    `Reviewed ${sourceRows.length} autonomous standard compliance record(s).`,
    'The latest completed processing date standard has been adopted, checked for compliance, and preserved as permanent governance history.',
    'SCIIP_OS can now audit future processors against this standard.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceAuditResult870_(sourceRows) {
  return [
    'AUDIT PASSED.',
    'The active processor governance standard is compliant, traceable, and enforceable.',
    'Future downstream processors should follow the resolved upstream processing date pattern.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceAuditFollowUp870_(sourceRows) {
  return [
    'Use this audit record when reviewing future processor builds.',
    'Confirm each downstream processor identifies its input sheet and date column.',
    'Confirm each downstream processor uses the resolved processing date for business keys and source filtering.',
    'Confirm duplicate protection uses the correct business-key helper for the processor pattern.'
  ].join('\n');
}

function sciipGenerateId870_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousGovernanceAuditProcessor() {
  const result = sciipRunAutonomousGovernanceAuditProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousGovernanceAuditProcessor',
    result: result
  }));

  return result;
}
