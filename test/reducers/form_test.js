import { expect } from "chai";
import form from "../../scripts/reducers/form";
import * as actions from "../../scripts/actions/form";

describe("form reducer", () => {
  const record = {id: 1, _status: "updated", last_modified: 2, title: "foo"};

  it("should update state with cleaned form data", () => {
    expect(form(undefined, {
      type: actions.FORM_RECORD_LOADED,
      record,
    })).eql({
      record,
      formData: {title: "foo"}
    });
  });

  it("should update state when form record is unloaded", () => {
    expect(form(undefined, {
      type: actions.FORM_RECORD_UNLOADED,
    })).eql({formData: null, record: null});
  });

  it("should update state when form data is received", () => {
    expect(form({record, formData: null}, {
      type: actions.FORM_DATA_RECEIVED,
      formData: {title: "baz"}
    })).eql({record, formData: {title: "baz"}});
  });
});
