import { expect } from "chai";

import configureStore from "../../scripts/store/configureStore";

describe("configureStore()", () => {
  describe("Plugin registration", () => {
    describe("New reducers", () => {
      let store;

      beforeEach(() => {
        store = configureStore({}, [
          {
            sagas: [],
            reducers: {
              count(state = 0, action) {
                return action.type === "INC" ? state + 1 : state;
              }
            }
          }
        ]);
      });

      it("should register a plugin reducer", () => {
        expect(store.getState())
          .to.have.property("count").eql(0);
      });

      it("should forward actions to the registered plugin reducer", () => {
        store.dispatch({type: "INC"});

        expect(store.getState())
          .to.have.property("count").eql(1);
      });
    });

    describe("Extended reducers", () => {
      let store;

      beforeEach(() => {
        store = configureStore({}, [
          {
            sagas: [],
            reducers: {
              collection(state, action) {
                return action.type === "BUSY" ? {
                  ...state,
                  busy: true,
                } : state;
              }
            }
          }
        ]);
      });

      it("should extend a standard reducer", () => {
        expect(store.getState())
          .to.have.property("collection")
          .to.have.property("busy").eql(false);
      });

      it("should forward actions to the registered plugin reducer", () => {
        store.dispatch({type: "BUSY"});

        expect(store.getState())
          .to.have.property("collection")
          .to.have.property("busy").eql(true);
      });
    });
  });
});
