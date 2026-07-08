#!/usr/bin/env bash
set -euo pipefail

# Remove prior layered override files that can shadow the clean shared helper.
rm -f src/processors/intelligence/execution/ZZZ_7060_7150_ExecutiveIntelligenceExecutionRuntimeContractOverride.gs
rm -f src/processors/intelligence/executive/ZZZ_7060_7150_ExecutiveIntelligenceExecutionRuntimeContractOverride.gs

# Remove duplicate/older explicit range patch names if present; the archive writes one canonical file.
rm -f src/tests/SCIIP_TestingFramework_v4_ExecutiveIntelligence_7060_7150_DiscoveryFix.gs

# Optional: keep both execution and executive shared helpers synchronized because both paths exist in this repo.
cp -f src/processors/intelligence/execution/7060_7150_ExecutiveIntelligenceExecutionShared.gs       src/processors/intelligence/executive/7060_7150_ExecutiveIntelligenceExecutionShared.gs

echo "SCIIP_OS v5.5 7060-7150 cleanup2 applied. Now run: clasp push"
