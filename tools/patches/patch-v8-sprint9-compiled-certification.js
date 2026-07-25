const fs = require("fs");
const path = require("path");

const repo = process.cwd();
const dist = path.join(repo, "dist", "apps-script");
const functionName = "sciipTestV8Sprint9AiCopilotGuidedDecisionWorkspace";
const marker = "SCIIP_OS v8.0 Sprint 9 public compiled certification wrapper";

if (!fs.existsSync(dist)) {
  console.error(`Compiled Apps Script directory not found: ${dist}`);
  process.exit(1);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const gsFiles = walk(dist).filter((file) => file.endsWith(".gs"));

if (!gsFiles.length) {
  console.error("No compiled .gs files were found.");
  process.exit(1);
}

const alreadyCompiled = gsFiles.find((file) =>
  fs.readFileSync(file, "utf8").includes(`function ${functionName}`)
);

if (alreadyCompiled) {
  console.log(`Sprint 9 certification already compiled in ${path.relative(repo, alreadyCompiled)}.`);
  process.exit(0);
}

let target = gsFiles.find((file) => path.basename(file) === "11_other_001.gs");

if (!target) {
  target = gsFiles.find((file) => path.basename(file).startsWith("11_other"));
}

if (!target) {
  target = gsFiles[gsFiles.length - 1];
}

const wrapper = `
/**
 * ${marker}
 */
function ${functionName}() {
  if (
    typeof SCIIP_V8_AI_COPILOT === "undefined" ||
    !SCIIP_V8_AI_COPILOT ||
    typeof SCIIP_V8_AI_COPILOT.certify !== "function"
  ) {
    throw new Error(
      "SCIIP V8 Sprint 9 AI Copilot application is unavailable in the compiled deployment."
    );
  }

  var result = SCIIP_V8_AI_COPILOT.certify();

  if (!result || result.status !== "PASSED") {
    throw new Error(
      "SCIIP V8 Sprint 9 certification failed: " + JSON.stringify(result)
    );
  }

  console.log(JSON.stringify(result));
  return result;
}
`;

let content = fs.readFileSync(target, "utf8");

if (!content.includes(marker)) {
  content = content.replace(/\s*$/, "\n\n") + wrapper.trim() + "\n";
  fs.writeFileSync(target, content);
}

const verified = fs.readFileSync(target, "utf8").includes(`function ${functionName}`);

if (!verified) {
  console.error(`Failed to inject ${functionName} into ${target}.`);
  process.exit(1);
}

console.log(`Injected ${functionName} into ${path.relative(repo, target)}.`);
