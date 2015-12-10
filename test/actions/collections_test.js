import sinon from "sinon";

import * as actions from "../../scripts/actions/collections";
import * as NotificationsActions from "../../scripts/actions/notifications";


describe("collections actions", () => {
  var sandbox, notifyError;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    notifyError = sandbox.stub(NotificationsActions, "notifyError");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("loadCollections()", () => {
    it("should retrieve the collection schema", (done) => {
      sandbox.stub(global, "fetch").returns(Promise.resolve({
        json() {
          return {a: 1};
        }
      }));
      const dispatch = sandbox.spy();

      actions.loadCollections()(dispatch);

      setImmediate(() => {
        sinon.assert.calledWithMatch(dispatch, {collections: {a: 1}});
        done();
      });
    });

    it("should notify from fetch errors", done => {
      sandbox.stub(global, "fetch").returns(
        Promise.reject(new Error("boo")));
      const dispatch = sandbox.spy();

      actions.loadCollections()(dispatch);

      setImmediate(() => {
        sinon.assert.calledWithMatch(notifyError, {message: "boo"});
        done();
      });
    });
  });
});
