import {
  COLLECTION_BUSY,
  COLLECTION_HISTORY_SUCCESS,
  COLLECTION_RESET,
  ROUTE_LOAD_FAILURE,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
} from "@src/constants";
import collection from "@src/reducers/collection";

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
