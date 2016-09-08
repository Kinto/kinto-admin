import { expect } from "chai";

import bucket from "../../src/reducers/bucket";
import {
  BUCKET_BUSY,
  BUCKET_RESET,
  BUCKET_LOAD_SUCCESS,
  BUCKET_COLLECTIONS_REQUEST,
  BUCKET_COLLECTIONS_SUCCESS,
  BUCKET_GROUPS_REQUEST,
  BUCKET_GROUPS_SUCCESS,
  BUCKET_HISTORY_REQUEST,
  BUCKET_HISTORY_SUCCESS,
} from "../../src/constants";


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
      id: "buck",
      collections: [],
      collectionsLoaded: false,
      groups: [],
      groupsLoaded: false,
      history: [],
      historyLoaded: false,
      data: {a: 2},
      permissions: {
        write: ["twitter:Natim"],
        read: ["github:n1k0", "github:almet"],
      }
    });
  });

  it("BUCKET_COLLECTIONS_REQUEST", () => {
    const state = {collectionsLoaded: true};
    const action = {type: BUCKET_COLLECTIONS_REQUEST};

    expect(bucket(state, action))
      .to.have.property("collectionsLoaded").eql(false);
  });

  it("BUCKET_COLLECTIONS_SUCCESS", () => {
    const state = {
      collections: [],
      collectionsLoaded: false,
    };
    const action = {
      type: BUCKET_COLLECTIONS_SUCCESS,
      collections: [1, 2, 3],
    };

    expect(bucket(state, action))
      .to.have.property("collections").eql(action.collections);
    expect(bucket(state, action))
      .to.have.property("collectionsLoaded").eql(true);
  });

  it("BUCKET_GROUPS_REQUEST", () => {
    const state = {groupsLoaded: true};
    const action = {type: BUCKET_GROUPS_REQUEST};

    expect(bucket(state, action))
      .to.have.property("groupsLoaded").eql(false);
  });

  it("BUCKET_GROUPS_SUCCESS", () => {
    const state = {
      groups: [],
      groupsLoaded: false,
    };
    const action = {
      type: BUCKET_GROUPS_SUCCESS,
      groups: [1, 2, 3],
    };

    expect(bucket(state, action))
      .to.have.property("groups").eql(action.groups);
    expect(bucket(state, action))
      .to.have.property("groupsLoaded").eql(true);
  });

  it("BUCKET_HISTORY_REQUEST", () => {
    const state = {historyLoaded: true};
    const action = {type: BUCKET_HISTORY_REQUEST};

    expect(bucket(state, action))
      .to.have.property("historyLoaded").eql(false);
  });

  it("BUCKET_HISTORY_SUCCESS", () => {
    const state = {
      history: [],
      historyLoaded: false,
    };
    const action = {
      type: BUCKET_HISTORY_SUCCESS,
      history: [1, 2, 3],
    };

    expect(bucket(state, action))
      .to.have.property("history").eql(action.history);
    expect(bucket(state, action))
      .to.have.property("historyLoaded").eql(true);
  });
});
