export const CONFLICTS_REPORTED = "CONFLICTS_REPORTED";

export function reportConflicts(conflicts) {
  return {
    type: CONFLICTS_REPORTED,
    conflicts,
  };
}
