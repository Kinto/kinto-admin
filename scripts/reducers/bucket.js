/* @flow */

import type { Bucket, BucketData, BucketPermissions } from "../types";
import {
  BUCKET_BUSY,
  BUCKET_RESET,
  BUCKET_LOAD_SUCCESS,
} from "../constants";
import { omit } from "../utils";


const INITIAL_STATE: Bucket = {
  busy: false,
  name: null,
  data: {},
  permissions: {
    "read": [],
    "write": [],
    "collection:create": [],
    "group:create": [],
  },
};

export function bucket(state: Bucket = INITIAL_STATE, action: Object) {
  switch (action.type) {
    case BUCKET_BUSY: {
      const {busy}: {busy: boolean} = action;
      return {...state, busy};
    }
    case BUCKET_LOAD_SUCCESS: {
      const {data, permissions}: {
        data: BucketData,
        permissions: BucketPermissions,
      } = action;
      return {
        ...state,
        data: omit(data, ["id", "last_modified"]),
        name: data.id,
        permissions: {
          read: permissions.read,
          write: permissions.write,
        },
      };
    }
    case BUCKET_RESET: {
      return INITIAL_STATE;
    }
    default: {
      return state;
    }
  }
}

export default bucket;
