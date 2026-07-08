/*******************************************************
 * SCIIP System Certification Writer
 *******************************************************/

function sciipRecordSystemCertification(certificationSummary) {
  const sheet = sciipEnsureSystemCertificationsSheet_();

  sheet.appendRow([
    'SYSTEM_CERTIFICATION_' + Utilities.getUuid(),
    certificationSummary.runId || '',
    'SCIIP_OS_RUNTIME',
    certificationSummary.certification || '',
    certificationSummary.processorsTested || 0,
    certificationSummary.processorsPassed || 0,
    certificationSummary.processorsFailed || 0,
    certificationSummary.startedAt || '',
    certificationSummary.completedAt || '',
    new Date().toISOString()
  ]);

  return certificationSummary;
}

function sciipEnsureSystemCertificationsSheet_() {
  const ss = sciipGetSpreadsheet_();
  const sheetName = 'SYSTEM_CERTIFICATIONS';

  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow([
      'Certification_ID',
      'Run_ID',
      'Certification_Surface',
      'Certification_Status',
      'Processors_Tested',
      'Processors_Passed',
      'Processors_Failed',
      'Run_Started_At',
      'Run_Completed_At',
      'Recorded_At'
    ]);
  }

  return sheet;
}