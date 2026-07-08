#!/bin/bash
set -euo pipefail

# Run from SCIIP_OS repository root after unzipping the patch.
# This removes the duplicate noncanonical Executive Intelligence folder and old nested patch artifact.

rm -rf src/processors/intelligence/executive
rm -rf SCIIP_OS_v5_5_7060_7150_patch

echo "SCIIP_OS 7060–7150 cleanup complete."
