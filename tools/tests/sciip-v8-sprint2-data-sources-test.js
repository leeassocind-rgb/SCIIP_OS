const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '../..');
const sourcePath = path.join(root, 'src/applications/web-application/SCIIP_V8_Data_Sources_SuperSheet_Workflow.gs');
const source = fs.readFileSync(sourcePath, 'utf8');
const logs = [];
const context = { console, Date, JSON, Math, Number, String, Boolean, Error, Logger: { log: x => logs.push(x) } };
vm.createContext(context);
vm.runInContext(source, context, { filename: sourcePath });
const result = context.sciipTestV8Sprint2DataSourcesSuperSheetUploadSchemaMapping();
if (!result || result.status !== 'PASSED') {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
console.log(JSON.stringify(result, null, 2));
