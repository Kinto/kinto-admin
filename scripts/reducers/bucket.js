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
};

export function bucket(state = INITIAL_STATE, action) {
  switch (action.type) {
    case BUCKET_BUSY: {
      return {...state, busy: action.busy};
    }
    case BUCKET_LOAD_SUCCESS: {
      let {bid, data} = action;
      if (typeof data === "undefined") {
        data = {id: bid};
      }
      return {
        ...state,
        data: omit(data, ["id", "last_modified"]),
        name: data.id,
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
