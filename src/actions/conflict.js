import {
  CONFLICT_REPORTED,
  CONFLICT_RESOLVED,
} from "../constants";



export function reportConflict(conflict) {
  return {
    type: CONFLICT_REPORTED,
    conflict,
  };
}

export function markResolved(id) {
  return {
    type: CONFLICT_RESOLVED,
    id,
  };
}
