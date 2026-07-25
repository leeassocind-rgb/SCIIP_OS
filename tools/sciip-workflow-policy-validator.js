"use strict";

const fs = require("fs");
const path = require("path");

const workflowDirectory = path.join(process.cwd(), ".github", "workflows");
const authoritativeWorkflow = "sciip-main-certification.yml";

function workflowFiles() {
  return fs
    .readdirSync(workflowDirectory)
    .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
    .sort();
}

function triggerBlock(source) {
  const match = source.match(
    /^on:\s*([\s\S]*?)(?=^(?:permissions|concurrency|env|jobs):)/m
  );

  return match ? match[0] : "";
}

const failures = [];
const files = workflowFiles();

for (const filename of files) {
  const fullPath = path.join(workflowDirectory, filename);
  const source = fs.readFileSync(fullPath, "utf8");
  const triggers = triggerBlock(source);

  if (!triggers) {
    failures.push(`${filename}: missing recognizable top-level on block`);
    continue;
  }

  const hasPush =
    /^on:\s*\[[^\]]*\bpush\b/m.test(triggers) ||
    /^\s+push:/m.test(triggers);

  const hasPullRequest =
    /^on:\s*\[[^\]]*\bpull_request\b/m.test(triggers) ||
    /^\s+pull_request:/m.test(triggers);

  const hasWorkflowDispatch =
    /^on:\s*\[[^\]]*\bworkflow_dispatch\b/m.test(triggers) ||
    /^\s+workflow_dispatch:/m.test(triggers);

  if (filename === authoritativeWorkflow) {
    if (!hasPush) {
      failures.push(`${filename}: push trigger is required`);
    }

    if (!hasPullRequest) {
      failures.push(`${filename}: pull_request trigger is required`);
    }

    if (!hasWorkflowDispatch) {
      failures.push(`${filename}: workflow_dispatch trigger is required`);
    }
  } else {
    if (hasPush || hasPullRequest) {
      failures.push(
        `${filename}: only ${authoritativeWorkflow} may run automatically`
      );
    }

    if (!hasWorkflowDispatch) {
      failures.push(`${filename}: historical workflow must remain manually runnable`);
    }
  }

  const nodeVersions = [
    ...source.matchAll(/node-version:\s*['"]?([0-9]+)['"]?/g),
  ].map((match) => match[1]);

  for (const version of nodeVersions) {
    if (!["20", "22"].includes(version)) {
      failures.push(`${filename}: unsupported Node version ${version}`);
    }
  }
}

if (!files.includes(authoritativeWorkflow)) {
  failures.push(`missing ${authoritativeWorkflow}`);
}

const result = {
  framework: "SCIIP_CI_WORKFLOW_POLICY",
  version: "v9.0-ci-stabilization.1",
  status: failures.length ? "FAILED" : "PASSED",
  workflowCount: files.length,
  authoritativeWorkflow,
  automaticWorkflowCount: failures.length ? null : 1,
  failures,
};

console.log(JSON.stringify(result, null, 2));

if (failures.length) {
  process.exit(1);
}
