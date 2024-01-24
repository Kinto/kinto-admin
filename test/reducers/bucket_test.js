import {
  BUCKET_BUSY,
  BUCKET_COLLECTIONS_REQUEST,
  BUCKET_COLLECTIONS_SUCCESS,
  BUCKET_HISTORY_NEXT_REQUEST,
  BUCKET_HISTORY_REQUEST,
  BUCKET_HISTORY_SUCCESS,
  BUCKET_RESET,
  ROUTE_LOAD_FAILURE,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
} from "../../src/constants";
import bucket from "../../src/reducers/bucket";

describe("bucket reducer", () => {
  describe("BUCKET_BUSY", () => {
    it("should set the busy flag", () => {
      expect(
        bucket(undefined, { type: BUCKET_BUSY, busy: true })
      ).toHaveProperty("busy", true);
    });
  });

  describe("BUCKET_RESET", () => {
    it("should reset the state to its initial value", () => {
      const initial = bucket(undefined, { type: null });
      const altered = bucket(initial, { type: BUCKET_BUSY, busy: true });
      expect(bucket(altered, { type: BUCKET_RESET })).toBe(initial);
    });
  });

  describe("ROUTE_LOAD_REQUEST", () => {
    it("should set the busy flag", () => {
      expect(
        bucket({ busy: false }, { type: ROUTE_LOAD_REQUEST })
      ).toHaveProperty("busy", true);
    });
  });

  describe("ROUTE_LOAD_SUCCESS", () => {
    it("should preserve state when no bucket is passed", () => {
      const initial = bucket(undefined, { type: null });

      expect(bucket(undefined, { type: ROUTE_LOAD_SUCCESS })).toStrictEqual(
        initial
      );
    });

    it("should preserve state when no groups are passed", () => {
      expect(
        bucket(
          { groups: [{ id: "g1" }] },
          { type: ROUTE_LOAD_SUCCESS, bucket: {} }
        )
      ).toHaveProperty("groups", [{ id: "g1" }]);
    });

    it("should update state when a bucket is passed", () => {
      const state = bucket(undefined, {
        type: ROUTE_LOAD_SUCCESS,
        bucket: {
          data: { id: "buck", last_modified: 42, foo: "bar" },
          permissions: { read: ["a"], write: ["b"] },
        },
      });

      expect(state.data).toStrictEqual({
        id: "buck",
        foo: "bar",
        last_modified: 42,
      });
      expect(state.permissions).toStrictEqual({ read: ["a"], write: ["b"] });
    });
  });

  describe("ROUTE_LOAD_FAILURE", () => {
    it("should clear the busy flag", () => {
      expect(
        bucket({ busy: true }, { type: ROUTE_LOAD_FAILURE })
      ).toHaveProperty("busy", false);
    });
  });

  describe("BUCKET_COLLECTIONS_REQUEST", () => {
    it("should update the collectionsLoaded flag", () => {
      const state = { collections: { loaded: true } };
      const action = { type: BUCKET_COLLECTIONS_REQUEST };

      const result = bucket(state, action);
      expect(result).toHaveProperty("collections");
      expect(result.collections).toHaveProperty("loaded", false);
    });
  });

  describe("BUCKET_COLLECTIONS_SUCCESS", () => {
    const state = {
      collections: {
        loaded: false,
        entries: [],
      },
    };
    const action = {
      type: BUCKET_COLLECTIONS_SUCCESS,
      entries: [1, 2, 3],
    };

    it("should update the list of bucket collections", () => {
      const result = bucket(state, action);
      expect(result).toHaveProperty("collections");
      expect(result.collections).toHaveProperty("entries", action.entries);
    });

    it("should update the collectionsLoaded flag", () => {
      expect(bucket(state, action).collections).toHaveProperty("loaded", true);
    });
  });

  describe("BUCKET_HISTORY_REQUEST", () => {
    it("should update the history loaded flag", () => {
      const state = { historyLoaded: true };
      const action = { type: BUCKET_HISTORY_REQUEST };
      const result = bucket(state, action);

      expect(result).toHaveProperty("history");
      expect(result.history).toHaveProperty("loaded", false);
    });
  });

  describe("BUCKET_HISTORY_NEXT_REQUEST", () => {
    it("should update the history loaded flag", () => {
      const state = { historyLoaded: true };
      const action = { type: BUCKET_HISTORY_NEXT_REQUEST };
      const result = bucket(state, action);

      expect(result).toHaveProperty("history");
      expect(result.history).toHaveProperty("loaded", false);
    });
  });

  describe("BUCKET_HISTORY_SUCCESS", () => {
    const fakeNext = () => {};
    const state = {
      history: {
        entries: [],
        loaded: false,
        hasNextPage: true,
        next: fakeNext,
      },
    };
    const action = {
      type: BUCKET_HISTORY_SUCCESS,
      entries: [1, 2, 3],
      hasNextPage: true,
      next: fakeNext,
    };
    const result = bucket(state, action);

    it("should update the list of history", () => {
      const result = bucket(state, action);
      expect(result).toHaveProperty("history");
      expect(result.history).toHaveProperty("entries", action.entries);
    });

    it("should update the historyLoaded flag", () => {
      expect(result.history).toHaveProperty("loaded", true);
    });

    it("should update the hasNextHistory flag", () => {
      expect(result.history).toHaveProperty("hasNextPage", true);
    });

    it("should update the listNextHistory flag", () => {
      expect(result.history).toHaveProperty("next", fakeNext);
    });
  });
});
