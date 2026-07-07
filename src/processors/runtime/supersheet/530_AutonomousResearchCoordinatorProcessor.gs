/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 530_AutonomousResearchCoordinatorProcessor
 *
 * RESEARCH_MISSIONS + INTELLIGENCE_REQUIREMENTS
 * → AUTONOMOUS_RESEARCH_COORDINATION
 *
 * Migration note:
 * Preserves original 530 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const AUTONOMOUS_RESEARCH_COORDINATOR_PROCESSOR = '530_AutonomousResearchCoordinatorProcessor';
const AUTONOMOUS_RESEARCH_COORDINATION_SHEET = 'AUTONOMOUS_RESEARCH_COORDINATION';

const AUTONOMOUS_RESEARCH_COORDINATION_HEADERS = [
  'Coordination_ID',
  'Business_Key',
  'Coordination_Date',
  'Coordination_Type',
  'Research_Mission_ID',
  'Requirement_ID',
  'Mission_Type',
  'Mission_Priority',
  'Coordination_Status',
  'Research_Route',
  'Research_Objective',
  'Research_Instructions',
  'Suggested_Sources',
  'Expected_Output',
  'Duplicate_Risk',
  'Human_Review_Status',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureAutonomousResearchCoordinationSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    AUTONOMOUS_RESEARCH_COORDINATION_SHEET,
    AUTONOMOUS_RESEARCH_COORDINATION_HEADERS
  );
}

function sciipRunAutonomousResearchCoordinatorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: AUTONOMOUS_RESEARCH_COORDINATOR_PROCESSOR,
    action: 'AUTONOMOUS_RESEARCH_COORDINATION_BUILD',
    sourceSheet: 'RESEARCH_MISSIONS',
    targetSheet: AUTONOMOUS_RESEARCH_COORDINATION_SHEET,
    ledgerSheet: 'AUTONOMOUS_RESEARCH_COORDINATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const missions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('RESEARCH_MISSIONS');
      const requirements = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('INTELLIGENCE_REQUIREMENTS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: missions.length + requirements.length,
        outputCount: missions.length || 1,
        summary: 'Autonomous research coordination runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: AUTONOMOUS_RESEARCH_COORDINATOR_PROCESSOR,
          inputSheets: [
            'RESEARCH_MISSIONS',
            'INTELLIGENCE_REQUIREMENTS'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousResearchCoordinationSchema();
      const coordinationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const coordinationBusinessKey = 'AUTONOMOUS_RESEARCH_COORDINATION|' + coordinationDate;

      if (sciipRuntimeBusinessKeyPrefixExists530_(definition.targetSheet, coordinationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: AUTONOMOUS_RESEARCH_COORDINATOR_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            researchCoordinationsCreated: 0,
            skippedDuplicate: 1,
            coordinationBusinessKey: coordinationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const missions = sciipGetRuntimeRecordsByDate530_(
        'RESEARCH_MISSIONS',
        'Mission_Date',
        coordinationDate
      );

      const requirements = sciipGetRuntimeRecordsByDate530_(
        'INTELLIGENCE_REQUIREMENTS',
        'Requirement_Date',
        coordinationDate
      );

      if (missions.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: AUTONOMOUS_RESEARCH_COORDINATOR_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            researchCoordinationsCreated: 0,
            skippedNoResearchMissions: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const coordinationRows = sciipCreateAutonomousResearchCoordinations_({
        businessKey: coordinationBusinessKey,
        coordinationDate: coordinationDate,
        missions: missions,
        requirements: requirements,
        processor: AUTONOMOUS_RESEARCH_COORDINATOR_PROCESSOR
      });

      coordinationRows.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: AUTONOMOUS_RESEARCH_COORDINATOR_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: coordinationRows.length,
        recordsRead: missions.length + requirements.length,
        processed: coordinationRows.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          researchMissionsReviewed: missions.length,
          intelligenceRequirementsReviewed: requirements.length,
          researchCoordinationsCreated: coordinationRows.length,
          skippedDuplicate: 0,
          coordinationBusinessKey: coordinationBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists530_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;

  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate530_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];

  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue530_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue530_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  }

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(
      parsed,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  }

  return text;
}

function sciipCreateAutonomousResearchCoordinations_(args) {
  const now = new Date();

  return args.missions.map(function(mission) {
    const missionId = sciipExtractFirstAvailable530_(mission, [
      'Research_Mission_ID',
      'Mission_ID',
      'Record_ID',
      'ID'
    ]);

    const requirementId = sciipExtractFirstAvailable530_(mission, [
      'Requirement_ID'
    ]);

    const missionType = sciipExtractFirstAvailable530_(mission, [
      'Mission_Type'
    ]);

    const missionPriority = sciipExtractFirstAvailable530_(mission, [
      'Mission_Priority',
      'Priority'
    ]) || 'MEDIUM';

    const matchedRequirement = sciipFindRequirementById_(args.requirements, requirementId);
    const researchRoute = sciipInferResearchRoute_(missionType, mission, matchedRequirement);
    const duplicateRisk = sciipInferResearchDuplicateRisk_(mission, args.missions);

    return [
      sciipGenerateId_('ARC'),
      args.businessKey + '|' + sciipNormalizeMissionKey530_(missionId || missionType),
      args.coordinationDate,
      'DAILY_RESEARCH_COORDINATION',
      missionId,
      requirementId,
      missionType,
      missionPriority,
      'QUEUED_FOR_RESEARCH',
      researchRoute,
      sciipExtractFirstAvailable530_(mission, [
        'Mission_Objective',
        'Research_Question'
      ]),
      sciipComposeResearchInstructions_({
        mission: mission,
        matchedRequirement: matchedRequirement,
        researchRoute: researchRoute
      }),
      sciipExtractFirstAvailable530_(mission, [
        'Suggested_Sources'
      ]),
      sciipExtractFirstAvailable530_(mission, [
        'Expected_Output'
      ]),
      duplicateRisk,
      'PENDING_OPERATOR_REVIEW',
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });
}

function sciipFindRequirementById_(requirements, requirementId) {
  if (!requirementId) return null;

  return requirements.find(function(req) {
    return sciipExtractFirstAvailable530_(req, [
      'Requirement_ID',
      'ID'
    ]) === requirementId;
  }) || null;
}

function sciipInferResearchRoute_(missionType, mission, requirement) {
  const combined = [
    missionType,
    sciipExtractFirstAvailable530_(mission, [
      'Research_Question',
      'Mission_Objective',
      'Research_Scope',
      'Target_Entities'
    ]),
    sciipExtractFirstAvailable530_(requirement, [
      'Requirement_Type',
      'Knowledge_Gap',
      'Research_Direction'
    ])
  ].join(' ').toLowerCase();

  if (combined.includes('market')) return 'MARKET_RESEARCH_ROUTE';

  if (
    combined.includes('company') ||
    combined.includes('tenant') ||
    combined.includes('supplier') ||
    combined.includes('oem')
  ) {
    return 'COMPANY_ENTITY_RESEARCH_ROUTE';
  }

  if (
    combined.includes('property') ||
    combined.includes('asset') ||
    combined.includes('building') ||
    combined.includes('ownership')
  ) {
    return 'PROPERTY_ENTITY_RESEARCH_ROUTE';
  }

  if (
    combined.includes('risk') ||
    combined.includes('threat') ||
    combined.includes('critical')
  ) {
    return 'RISK_RESEARCH_ROUTE';
  }

  if (
    combined.includes('workflow') ||
    combined.includes('system') ||
    combined.includes('automation') ||
    combined.includes('autonomous')
  ) {
    return 'OPERATING_SYSTEM_RESEARCH_ROUTE';
  }

  return 'GENERAL_RESEARCH_ROUTE';
}

function sciipComposeResearchInstructions_(args) {
  const question = sciipExtractFirstAvailable530_(args.mission, [
    'Research_Question'
  ]);

  const scope = sciipExtractFirstAvailable530_(args.mission, [
    'Research_Scope'
  ]);

  const targetEntities = sciipExtractFirstAvailable530_(args.mission, [
    'Target_Entities'
  ]);

  const requirementGap = sciipExtractFirstAvailable530_(args.matchedRequirement, [
    'Knowledge_Gap'
  ]);

  const parts = [];

  parts.push('Route: ' + args.researchRoute + '.');

  if (question) parts.push('Answer this question: ' + question);
  if (scope) parts.push('Research scope: ' + scope);
  if (targetEntities) parts.push('Target entities: ' + targetEntities);
  if (requirementGap) parts.push('Knowledge gap to resolve: ' + requirementGap);

  parts.push(
    'Do not overwrite existing knowledge. Produce source-backed findings, confidence level, affected entities, and recommended next action.'
  );

  return parts.join('\n');
}

function sciipInferResearchDuplicateRisk_(mission, allMissions) {
  const missionQuestion = sciipNormalizeComparisonText530_(
    sciipExtractFirstAvailable530_(mission, [
      'Research_Question',
      'Mission_Objective'
    ])
  );

  if (!missionQuestion) return 'UNKNOWN';

  const similarCount = allMissions.filter(function(other) {
    const otherQuestion = sciipNormalizeComparisonText530_(
      sciipExtractFirstAvailable530_(other, [
        'Research_Question',
        'Mission_Objective'
      ])
    );

    return otherQuestion === missionQuestion;
  }).length;

  if (similarCount > 1) return 'POSSIBLE_DUPLICATE';
  return 'LOW';
}

function sciipNormalizeComparisonText530_(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function sciipNormalizeMissionKey530_(value) {
  return String(value || 'MISSION')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80);
}

function sciipExtractFirstAvailable530_(record, fieldNames) {
  if (!record) return '';

  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    if (record[fieldName] !== undefined && record[fieldName] !== null && record[fieldName] !== '') {
      return String(record[fieldName]);
    }
  }

  return '';
}

function sciipTestAutonomousResearchCoordinatorProcessor() {
  const result = sciipRunAutonomousResearchCoordinatorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousResearchCoordinatorProcessor',
    result: result
  }));

  return result;
}
