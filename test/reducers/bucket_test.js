import { expect } from "chai";

import bucket from "../../scripts/reducers/bucket";
import {
  BUCKET_BUSY,
  BUCKET_RESET,
  BUCKET_LOAD_SUCCESS,
} from "../../scripts/constants";


describe("bucket reducer", () => {
  it("BUCKET_BUSY", () => {
    expect(bucket(undefined, {type: BUCKET_BUSY, busy: true}))
      .to.have.property("busy").eql(true);
  });

  it("BUCKET_RESET", () => {
    const initial = bucket(undefined, {type: null});
    const altered = bucket(initial, {type: BUCKET_BUSY, busy: true});
    expect(bucket(altered, {type: BUCKET_RESET}))
      .eql(initial);
  });

  it("BUCKET_LOAD_SUCCESS", () => {
    expect(bucket(undefined, {
      type: BUCKET_LOAD_SUCCESS,
      data: {id: "buck", a: 2, last_modified: 42},
      permissions: {
        write: ["twitter:Natim"],
        read: ["github:n1k0", "github:almet"],
      }
    })).eql({
      busy: false,
      collections: [],
      groups: [],
      history: [],
      listLoaded: false,
      name: "buck",
      data: {a: 2},
      permissions: {
        write: ["twitter:Natim"],
        read: ["github:n1k0", "github:almet"],
      }
    });
  });
});
