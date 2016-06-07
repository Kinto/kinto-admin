import {
  BUCKET_BUSY,
  BUCKET_RESET,
  BUCKET_LOAD_SUCCESS,
} from "../constants";
import { omit } from "../utils";


const INITIAL_STATE = {
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

export function bucket(state = INITIAL_STATE, action) {
  switch (action.type) {
    case BUCKET_BUSY: {
      return {...state, busy: action.busy};
    }
    case BUCKET_LOAD_SUCCESS: {
      const {data={}, permissions={}} = action;
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
