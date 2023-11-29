import collection from "../../src/reducers/collection";
import {
  COLLECTION_BUSY,
  COLLECTION_RESET,
  COLLECTION_RECORDS_REQUEST,
  COLLECTION_RECORDS_SUCCESS,
  COLLECTION_HISTORY_SUCCESS,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
  ROUTE_LOAD_FAILURE,
} from "../../src/constants";

describe("collection reducer", () => {
  it("COLLECTION_BUSY", () => {
    expect(
      collection(undefined, { type: COLLECTION_BUSY, busy: true })
    ).toHaveProperty("busy", true);
  });

  it("COLLECTION_RESET", () => {
    const initial = collection(undefined, { type: null });
    const altered = collection(initial, { type: COLLECTION_BUSY, busy: true });
    expect(collection(altered, { type: COLLECTION_RESET })).toStrictEqual(
      initial
    );
  });

  describe("COLLECTION_RECORDS_REQUEST", () => {
    it("should update the recordsLoaded flag", () => {
      expect(
        collection(
          { data: {}, recordsLoaded: true },
          {
            type: COLLECTION_RECORDS_REQUEST,
          }
        )
      ).toHaveProperty("recordsLoaded", false);
    });

    it("should update the currentSort parameter", () => {
      expect(
        collection(undefined, {
          type: COLLECTION_RECORDS_REQUEST,
          sort: "title",
        })
      ).toHaveProperty("currentSort", "title");
    });

    it("should use default prefered sort when none is provided", () => {
      expect(
        collection(
          { data: { sort: "plop" } },
          {
            type: COLLECTION_RECORDS_REQUEST,
          }
        )
      ).toHaveProperty("currentSort", "plop");
    });

    it("should use default sort when none is provided", () => {
      expect(
        collection(
          { data: {} },
          {
            type: COLLECTION_RECORDS_REQUEST,
          }
        )
      ).toHaveProperty("currentSort", "-last_modified");
    });

    it("should reset records list when the sort param changes", () => {
      expect(
        collection(
          {
            data: { sort: "initial" },
            records: [1, 2, 3],
          },
          {
            type: COLLECTION_RECORDS_REQUEST,
            sort: "title",
          }
        )
      ).toHaveProperty("records", []);
    });
  });

  describe("ROUTE_LOAD_REQUEST", () => {
    it("should set the busy flag", () => {
      expect(
        collection({ busy: false }, { type: ROUTE_LOAD_REQUEST })
      ).toHaveProperty("busy", true);
    });
  });

  describe("ROUTE_LOAD_SUCCESS", () => {
    it("should preserve state when no collection is passed", () => {
      const initial = collection(undefined, { type: null });

      expect(collection(undefined, { type: ROUTE_LOAD_SUCCESS })).toStrictEqual(
        initial
      );
    });

    it("should update state when a collection is passed", () => {
      const state = collection(undefined, {
        type: ROUTE_LOAD_SUCCESS,
        collection: {
          data: { id: "coll", last_modified: 42, foo: "bar" },
          permissions: { read: ["a"], write: ["b"] },
        },
      });

      expect(state.data).toHaveProperty("id", "coll");
      expect(state.data).toHaveProperty("last_modified", 42);
      expect(state.data).toHaveProperty("foo", "bar");
      expect(state.permissions).toStrictEqual({ read: ["a"], write: ["b"] });
    });
  });

  describe("ROUTE_LOAD_FAILURE", () => {
    it("should clear the busy flag", () => {
      expect(
        collection({ busy: true }, { type: ROUTE_LOAD_FAILURE })
      ).toHaveProperty("busy", false);
    });
  });

  describe("COLLECTION_RECORDS_SUCCESS", () => {
    const records = [1, 2, 3];

    let state;

    beforeEach(() => {
      state = collection(undefined, {
        type: COLLECTION_RECORDS_SUCCESS,
        records,
      });
    });

    it("should assign received records to state", () => {
      expect(state.records).toStrictEqual(records);
    });

    it("should mark records as loaded", () => {
      expect(state.recordsLoaded).toBe(true);
    });

    it("should append new records received to existing list", () => {
      const state2 = collection(state, {
        type: COLLECTION_RECORDS_SUCCESS,
        records: [4, 5],
        isNextPage: true,
      });

      expect(state2.records).toStrictEqual([1, 2, 3, 4, 5]);
    });

    it("should pull fresh records when isNextPage is false", () => {
      const state2 = collection(state, {
        type: COLLECTION_RECORDS_SUCCESS,
        records: [4, 5],
        isNextPage: false,
      });

      expect(state2.records).toStrictEqual([4, 5]);
    });
  });

  describe("COLLECTION_HISTORY_SUCCESS", () => {
    it("should update history state", () => {
      const fakeNext = () => {};
      const initial = {
        history: {
          entries: [],
          loaded: false,
          hasNextPage: true,
          next: fakeNext,
        },
      };
      const action = {
        type: COLLECTION_HISTORY_SUCCESS,
        entries: [1, 2, 3],
        hasNextPage: true,
        next: fakeNext,
      };

      const state = collection(initial, action);

      expect(state.history.entries).toStrictEqual([1, 2, 3]);
      expect(state.history.loaded).toBe(true);
      expect(state.history.hasNextPage).toBe(true);
      expect(state.history.next).toBe(fakeNext);
    });
  });
});
