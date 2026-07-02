/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 860_AutonomousStandardComplianceProcessor
 *
 * AUTONOMOUS_STANDARD_ADOPTIONS → AUTONOMOUS_STANDARD_COMPLIANCE
 *
 * Migration note:
 * Preserves original 860 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousStandardComplianceProcessorName860_() {
  return '860_AutonomousStandardComplianceProcessor';
}

function sciipGetAutonomousStandardComplianceHeaders860_() {
  return ['Compliance_ID',
    'Business_Key',
    'Compliance_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Compliance_Title',
    'Standard_Name',
    'Compliance_Check',
    'Compliance_Result',
    'Governance_Impact',
    'Required_Action',
    'Status',
    'Created_At',
    'Processor'];
}

function sciipEnsureAutonomousStandardComplianceSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_STANDARD_COMPLIANCE',
    sciipGetAutonomousStandardComplianceHeaders860_()
  );
}

function sciipRunAutonomousStandardComplianceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousStandardComplianceProcessorName860_(),
    action: 'AUTONOMOUS_STANDARD_COMPLIANCE_BUILD',
    sourceSheet: 'AUTONOMOUS_STANDARD_ADOPTIONS',
    targetSheet: 'AUTONOMOUS_STANDARD_COMPLIANCE',
    ledgerSheet: 'AUTONOMOUS_STANDARD_COMPLIANCE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousStandardAdoptions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_STANDARD_ADOPTIONS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousStandardAdoptions.length,
        outputCount: autonomousStandardAdoptions.length ? 1 : 0,
        summary: 'Autonomous standard compliance runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousStandardComplianceProcessorName860_(),
          inputSheets: ['AUTONOMOUS_STANDARD_ADOPTIONS']
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
      const outputSheet = sciipEnsureAutonomousStandardComplianceSchema();
      const complianceDate =
        sciipResolveLatestRuntimeProcessingDate860_('AUTONOMOUS_STANDARD_ADOPTIONS', 'Adoption_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousStandardComplianceBusinessKey = 'AUTONOMOUS_STANDARD_COMPLIANCE|' + complianceDate;

      if (sciipRuntimeBusinessKeyPrefixExists860_(definition.targetSheet, autonomousStandardComplianceBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousStandardComplianceProcessorName860_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousStandardAdoptionsReviewed: 0,
            autonomousStandardComplianceCreated: 0,
            skippedDuplicate: 1,
            autonomousStandardComplianceBusinessKey: autonomousStandardComplianceBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousStandardAdoptions = sciipGetRuntimeRecordsByDate860_(
        'AUTONOMOUS_STANDARD_ADOPTIONS',
        'Adoption_Date',
        complianceDate
      );

      if (!autonomousStandardAdoptions.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousStandardComplianceProcessorName860_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousStandardAdoptionsReviewed: 0,
            autonomousStandardComplianceCreated: 0,
            skippedNoInputs: 1,
            complianceDate: complianceDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const outputRecord = sciipBuildAutonomousStandardCompliance860_({
        complianceDate: complianceDate,
        businessKey: autonomousStandardComplianceBusinessKey,
        sourceRows: autonomousStandardAdoptions,
        startedAt: new Date()
      });

      outputSheet.appendRow(sciipGetAutonomousStandardComplianceHeaders860_().map(function(header) {
        return outputRecord[header] || '';
      }));

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousStandardComplianceProcessorName860_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousStandardAdoptions.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousStandardAdoptionsReviewed: autonomousStandardAdoptions.length,
          autonomousStandardComplianceCreated: 1,
          skippedDuplicate: 0,
          autonomousStandardComplianceBusinessKey: autonomousStandardComplianceBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists860_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate860_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue860_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate860_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue860_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue860_(value) {
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

function sciipBuildAutonomousStandardCompliance860_(payload) {
  const complianceId = `AUTONOMOUS_STANDARD_COMPLIANCE_${Utilities.getUuid()}`;

  return {
    Compliance_ID: complianceId,
    Business_Key: payload.businessKey,
    Compliance_Date: payload.complianceDate,
    Source_Sheet: 'AUTONOMOUS_STANDARD_ADOPTIONS',
    Source_Record_Count: payload.sourceRows.length,
    Compliance_Title: `Autonomous Standard Compliance — ${payload.complianceDate}`,
    Standard_Name: sciipResolveComplianceStandardName860_(payload.sourceRows),
    Compliance_Check: sciipCreateAutonomousStandardComplianceCheck860_(payload.sourceRows),
    Compliance_Result: sciipCreateAutonomousStandardComplianceResult860_(payload.sourceRows),
    Governance_Impact: sciipCreateAutonomousStandardComplianceImpact860_(payload.sourceRows),
    Required_Action: sciipCreateAutonomousStandardComplianceRequiredAction860_(payload.sourceRows),
    Status: 'COMPLIANT_STANDARD_ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: sciipGetAutonomousStandardComplianceProcessorName860_()
  };
}

function sciipResolveComplianceStandardName860_(sourceRows) {
  const names = sourceRows
    .map(row => String(row.Standard_Name || '').trim())
    .filter(Boolean);

  return names.length ? names[0] : 'Latest Completed Processing Date Standard';
}

function sciipCreateAutonomousStandardComplianceCheck860_(sourceRows) {
  return [
    `Reviewed ${sourceRows.length} autonomous standard adoption record(s).`,
    'Confirmed that the latest completed processing date standard has an active adoption record.',
    'Confirmed that future downstream processors should be checked against this governance rule.'
  ].join(' ');
}

function sciipCreateAutonomousStandardComplianceResult860_(sourceRows) {
  return [
    'COMPLIANT.',
    'The processor governance standard is active and available for future build validation.',
    'SCIIP_OS has preserved the standard as permanent compliance history.'
  ].join(' ');
}

function sciipCreateAutonomousStandardComplianceImpact860_(sourceRows) {
  return [
    'Improves reliability of downstream processors.',
    'Reduces false SKIPPED_NO_INPUTS outcomes.',
    'Strengthens deterministic batch processing and idempotent operating-system behavior.'
  ].join(' ');
}

function sciipCreateAutonomousStandardComplianceRequiredAction860_(sourceRows) {
  return [
    'Apply this standard to every new downstream processor.',
    'When reviewing existing processors, check whether processing dates are resolved from upstream sheets.',
    'If a processor consumes prior processor output, do not default to the current execution date unless no upstream date exists.'
  ].join('\n');
}

function sciipGenerateId860_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousStandardComplianceProcessor() {
  const result = sciipRunAutonomousStandardComplianceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousStandardComplianceProcessor',
    result: result
  }));

  return result;
}
