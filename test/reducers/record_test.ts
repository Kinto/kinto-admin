import {
  RECORD_BUSY,
  RECORD_CREATE_REQUEST,
  RECORD_DELETE_REQUEST,
  RECORD_RESET,
  RECORD_UPDATE_REQUEST,
  ROUTE_LOAD_FAILURE,
  ROUTE_LOAD_REQUEST,
  ROUTE_LOAD_SUCCESS,
} from "@src/constants";
import record from "@src/reducers/record";

describe("record reducer", () => {
  describe("busy flag", () => {
    it("RECORD_BUSY", () => {
      expect(
        record({ busy: false }, { type: RECORD_BUSY, busy: true })
      ).toHaveProperty("busy", true);
    });

    it("ROUTE_LOAD_REQUEST", () => {
      expect(
        record({ busy: false }, { type: ROUTE_LOAD_REQUEST })
      ).toHaveProperty("busy", true);
    });

    it("RECORD_CREATE_REQUEST", () => {
      expect(
        record({ busy: false }, { type: RECORD_CREATE_REQUEST })
      ).toHaveProperty("busy", true);
    });

    it("RECORD_UPDATE_REQUEST", () => {
      expect(
        record({ busy: false }, { type: RECORD_UPDATE_REQUEST })
      ).toHaveProperty("busy", true);
    });

    it("RECORD_DELETE_REQUEST", () => {
      expect(
        record({ busy: false }, { type: RECORD_DELETE_REQUEST })
      ).toHaveProperty("busy", true);
    });
  });

  describe("ROUTE_LOAD_SUCCESS", () => {
    it("should preserve state when no record is passed", () => {
      const initial = record(undefined, { type: null });

      expect(record(undefined, { type: ROUTE_LOAD_SUCCESS })).toStrictEqual(
        initial
      );
    });

    it("should update state when a record is passed", () => {
      const state = record(undefined, {
        type: ROUTE_LOAD_SUCCESS,
        record: {
          data: { id: "uuid", last_modified: 42, foo: "bar" },
          permissions: { read: ["a"], write: ["b"] },
        },
      });

      expect(state.data).toStrictEqual({
        id: "uuid",
        foo: "bar",
        last_modified: 42,
      });
      expect(state.permissions).toStrictEqual({ read: ["a"], write: ["b"] });
    });
  });

  describe("ROUTE_LOAD_FAILURE", () => {
    it("should clear the busy flag", () => {
      expect(
        record({ busy: true }, { type: ROUTE_LOAD_FAILURE })
      ).toHaveProperty("busy", false);
    });
  });

  describe("RECORD_RESET", () => {
    it("should reset record to initial state", () => {
      const initial = record(undefined, { type: "@@INIT" });
      expect(
        record(
          {
            busy: true,
            data: { foo: "bar" },
            permissions: {
              write: [1],
              read: [2],
            },
            history: [1, 2],
            historyLoaded: true,
          },
          { type: RECORD_RESET }
        )
      ).toStrictEqual(initial);
    });
  });
});
