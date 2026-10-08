import { computeFromCertifiedSnapshot, CONTRACT } from "./AirBoundedAvailabilityRateEngineV1.proposal.mjs";

export const ADAPTER_CONTRACT = "SCIIP_BOUNDED_AVAILABILITY_RUNTIME_ADAPTER_V1";

export function createBoundedAvailabilityRuntimeAdapter({certifiedSnapshot}) {
  if (!certifiedSnapshot) throw new Error("certifiedSnapshot is required at adapter construction");
  const first=computeFromCertifiedSnapshot(certifiedSnapshot);
  return Object.freeze({
    contract: ADAPTER_CONTRACT,
    metricContract: CONTRACT,
    readOnly: true,
    uiPublicationAuthorized: false,
    vacancyRateAuthorized: false,
    getBoundedAvailabilityMetric() {
      return computeFromCertifiedSnapshot(certifiedSnapshot);
    },
    getSnapshotFingerprint() {
      return first.snapshotFingerprintSha256;
    }
  });
}
