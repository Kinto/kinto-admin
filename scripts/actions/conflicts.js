export const CONFLICTS_REPORTED = "CONFLICTS_REPORTED";
export const CONFLICT_RESOLVED = "CONFLICT_RESOLVED";


export function reportConflicts(conflicts) {
  return {
    type: CONFLICTS_REPORTED,
    conflicts,
  };
}

export function markResolved(id) {
  return {
    type: CONFLICT_RESOLVED,
    id,
  };
}
