/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 850_AutonomousStandardAdoptionProcessor
 *
 * AUTONOMOUS_STANDARDIZATIONS → AUTONOMOUS_STANDARD_ADOPTIONS
 *
 * Migration note:
 * Preserves original 850 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousStandardAdoptionProcessorName850_() {
  return '850_AutonomousStandardAdoptionProcessor';
}

function sciipGetAutonomousStandardAdoptionHeaders850_() {
  return ['Adoption_ID',
    'Business_Key',
    'Adoption_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Adoption_Title',
    'Standard_Name',
    'Adoption_Scope',
    'Adoption_Rationale',
    'Governance_Rule',
    'Compliance_Status',
    'Status',
    'Created_At',
    'Processor'];
}

function sciipEnsureAutonomousStandardAdoptionSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_STANDARD_ADOPTIONS',
    sciipGetAutonomousStandardAdoptionHeaders850_()
  );
}

function sciipRunAutonomousStandardAdoptionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousStandardAdoptionProcessorName850_(),
    action: 'AUTONOMOUS_STANDARD_ADOPTION_BUILD',
    sourceSheet: 'AUTONOMOUS_STANDARDIZATIONS',
    targetSheet: 'AUTONOMOUS_STANDARD_ADOPTIONS',
    ledgerSheet: 'AUTONOMOUS_STANDARD_ADOPTIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousStandardizations = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_STANDARDIZATIONS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousStandardizations.length,
        outputCount: autonomousStandardizations.length ? 1 : 0,
        summary: 'Autonomous standard adoption runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousStandardAdoptionProcessorName850_(),
          inputSheets: ['AUTONOMOUS_STANDARDIZATIONS']
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
      const outputSheet = sciipEnsureAutonomousStandardAdoptionSchema();
      const adoptionDate =
        sciipResolveLatestRuntimeProcessingDate850_('AUTONOMOUS_STANDARDIZATIONS', 'Standard_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousStandardAdoptionBusinessKey = 'AUTONOMOUS_STANDARD_ADOPTION|' + adoptionDate;

      if (sciipRuntimeBusinessKeyPrefixExists850_(definition.targetSheet, autonomousStandardAdoptionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousStandardAdoptionProcessorName850_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousStandardizationsReviewed: 0,
            autonomousStandardAdoptionsCreated: 0,
            skippedDuplicate: 1,
            autonomousStandardAdoptionBusinessKey: autonomousStandardAdoptionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousStandardizations = sciipGetRuntimeRecordsByDate850_(
        'AUTONOMOUS_STANDARDIZATIONS',
        'Standard_Date',
        adoptionDate
      );

      if (!autonomousStandardizations.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousStandardAdoptionProcessorName850_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousStandardizationsReviewed: 0,
            autonomousStandardAdoptionsCreated: 0,
            skippedNoInputs: 1,
            adoptionDate: adoptionDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const outputRecord = sciipBuildAutonomousStandardAdoption850_({
        adoptionDate: adoptionDate,
        businessKey: autonomousStandardAdoptionBusinessKey,
        sourceRows: autonomousStandardizations,
        startedAt: new Date()
      });

      outputSheet.appendRow(sciipGetAutonomousStandardAdoptionHeaders850_().map(function(header) {
        return outputRecord[header] || '';
      }));

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousStandardAdoptionProcessorName850_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousStandardizations.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousStandardizationsReviewed: autonomousStandardizations.length,
          autonomousStandardAdoptionsCreated: 1,
          skippedDuplicate: 0,
          autonomousStandardAdoptionBusinessKey: autonomousStandardAdoptionBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists850_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate850_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue850_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate850_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue850_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue850_(value) {
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

function sciipBuildAutonomousStandardAdoption850_(payload) {
  const adoptionId = `AUTONOMOUS_STANDARD_ADOPTION_${Utilities.getUuid()}`;

  return {
    Adoption_ID: adoptionId,
    Business_Key: payload.businessKey,
    Adoption_Date: payload.adoptionDate,
    Source_Sheet: 'AUTONOMOUS_STANDARDIZATIONS',
    Source_Record_Count: payload.sourceRows.length,
    Adoption_Title: `Autonomous Standard Adoption — ${payload.adoptionDate}`,
    Standard_Name: sciipResolveAdoptedStandardName850_(payload.sourceRows),
    Adoption_Scope: sciipCreateAutonomousStandardAdoptionScope850_(payload.sourceRows),
    Adoption_Rationale: sciipCreateAutonomousStandardAdoptionRationale850_(payload.sourceRows),
    Governance_Rule: sciipCreateAutonomousStandardGovernanceRule850_(payload.sourceRows),
    Compliance_Status: 'STANDARD_ADOPTED',
    Status: 'ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: sciipGetAutonomousStandardAdoptionProcessorName850_()
  };
}

function sciipResolveAdoptedStandardName850_(sourceRows) {
  const names = sourceRows
    .map(row => String(row.Standard_Name || '').trim())
    .filter(Boolean);

  return names.length ? names[0] : 'Latest Completed Processing Date Standard';
}

function sciipCreateAutonomousStandardAdoptionScope850_(sourceRows) {
  return [
    'Applies to all downstream SCIIP_OS processors that consume prior processor output sheets.',
    'Applies to business-key generation, source-row filtering, duplicate detection, and test expectations.',
    'Applies especially to processors that may run after the upstream batch date.'
  ].join(' ');
}

function sciipCreateAutonomousStandardAdoptionRationale850_(sourceRows) {
  return [
    `SCIIP_OS reviewed ${sourceRows.length} active standardization record(s).`,
    'The latest completed processing date standard has been validated through the 750 processor fix and downstream autonomous improvement chain.',
    'Adopting this standard reduces false SKIPPED_NO_INPUTS outcomes and improves deterministic batch continuity.'
  ].join(' ');
}

function sciipCreateAutonomousStandardGovernanceRule850_(sourceRows) {
  return [
    'Before building or revising a downstream processor, identify the upstream input sheet and upstream date column.',
    'Resolve the processing date using sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN).',
    'Use the resolved date consistently in the business key and source-row filter.',
    'Use sciipBusinessKeyPrefixExists_() for batch-oriented duplicate checks.',
    'Do not assume the current execution date unless no upstream processing date exists.'
  ].join('\n');
}

function sciipGenerateId850_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousStandardAdoptionProcessor() {
  const result = sciipRunAutonomousStandardAdoptionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousStandardAdoptionProcessor',
    result: result
  }));

  return result;
}
