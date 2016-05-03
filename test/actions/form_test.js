import sinon from "sinon";

import * as actions from "../../scripts/actions/form";
import * as CollectionActions from "../../scripts/actions/collection";


describe("form actions", () => {
  var sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("submitForm()", () => {
    let dispatch, getState, update;

    beforeEach(() => {
      dispatch = sandbox.spy();
      getState = () => ({
        form: {
          record: {
            id: "toto",
            last_modified: 42,
            _status: "updated"
          },
          formData: {
            id: undefined,
            foo: "bar"
          },
        }
      });
      update = sandbox.stub(CollectionActions, "update");
    });

    it("should strip ignored fields from provided formData", (done) => {
      actions.submitForm()(dispatch, getState);

      setImmediate(() => {
        sinon.assert.calledWith(update, {
          id: "toto",
          last_modified: 42,
          _status: "updated",
          foo: "bar"
        });
        done();
      });
    });
  });
});
