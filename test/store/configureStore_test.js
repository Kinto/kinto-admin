import { expect } from "chai";

import configureStore from "../../src/store/configureStore";

describe("configureStore()", () => {
  describe("Plugin registration", () => {
    describe("New reducers", () => {
      let store;

      beforeEach(() => {
        store = configureStore({}, [
          {
            sagas: [],
            reducers: {
              count: (state = 0, action) => {
                return action.type === "INC" ? state + 1 : state;
              },
            },
          },
        ]);
      });

      it("should register a plugin reducer", () => {
        expect(store.getState()).to.have.property("count").eql(0);
      });

      it("should forward actions to the registered plugin reducer", () => {
        store.dispatch({ type: "INC" });

        expect(store.getState()).to.have.property("count").eql(1);
      });
    });

    describe("Single extended reducer", () => {
      let store;

      beforeEach(() => {
        store = configureStore({}, [
          {
            sagas: [],
            reducers: {
              collection: (state, action) => {
                return action.type === "BUSY"
                  ? {
                      ...state,
                      busy: true,
                    }
                  : state;
              },
            },
          },
        ]);
      });

      it("should extend a standard reducer", () => {
        expect(store.getState()).to.have
          .property("collection")
          .to.have.property("busy")
          .eql(false);
      });

      it("should forward actions to the registered plugin reducer", () => {
        store.dispatch({ type: "BUSY" });

        expect(store.getState()).to.have
          .property("collection")
          .to.have.property("busy")
          .eql(true);
      });
    });

    describe("Multiple extended reducers", () => {
      describe("Same name", () => {
        let store;

        beforeEach(() => {
          store = configureStore({}, [
            {
              sagas: [],
              reducers: {
                collection: (state, action) => {
                  return action.type === "BUSY"
                    ? {
                        ...state,
                        busy: true,
                      }
                    : state;
                },
              },
            },
            {
              sagas: [],
              reducers: {
                collection: (state, action) => {
                  return action.type === "LOADED"
                    ? {
                        ...state,
                        recordsLoaded: true,
                      }
                    : state;
                },
              },
            },
          ]);
        });

        it("should extend a standard reducer", () => {
          expect(store.getState()).to.have
            .property("collection")
            .to.have.property("recordsLoaded")
            .eql(false);
        });

        it("should override previously registered reducer with the same name", () => {
          store.dispatch({ type: "BUSY" });

          expect(store.getState()).to.have
            .property("collection")
            .to.have.property("busy")
            .eql(false);

          store.dispatch({ type: "LOADED" });

          expect(store.getState()).to.have
            .property("collection")
            .to.have.property("recordsLoaded")
            .eql(true);
        });
      });

      describe("Distinct names", () => {
        let store;

        beforeEach(() => {
          store = configureStore({}, [
            {
              sagas: [],
              reducers: {
                bucket: (state, action) => {
                  return action.type === "BUSY"
                    ? {
                        ...state,
                        busy: true,
                      }
                    : state;
                },
              },
            },
            {
              sagas: [],
              reducers: {
                collection: (state, action) => {
                  return action.type === "LOADED"
                    ? {
                        ...state,
                        recordsLoaded: true,
                      }
                    : state;
                },
              },
            },
          ]);
        });

        it("should extend a standard reducer", () => {
          expect(store.getState()).to.have
            .property("bucket")
            .to.have.property("busy")
            .eql(false);

          expect(store.getState()).to.have
            .property("collection")
            .to.have.property("recordsLoaded")
            .eql(false);
        });

        it("should override previously registered reducer with the same name", () => {
          store.dispatch({ type: "BUSY" });

          expect(store.getState()).to.have
            .property("bucket")
            .to.have.property("busy")
            .eql(true);

          store.dispatch({ type: "LOADED" });

          expect(store.getState()).to.have
            .property("collection")
            .to.have.property("recordsLoaded")
            .eql(true);
        });
      });
    });
  });
});
