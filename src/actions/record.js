/* @flow */

import type { Action } from "../types";


import { RECORD_RESET } from "../constants";


export function resetRecord(): Action {
  return {type: RECORD_RESET};
}
