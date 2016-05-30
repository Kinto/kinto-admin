import { expect } from "chai";
import sinon from "sinon";

import {cleanRecord, recordField} from "../scripts/utils";

describe("cleanRecord", () => {
  it("should remove id, schema and last_modified from properties", () => {
    expect(cleanRecord({
      id: "toto",
      last_modified: 1234,
      schema: 5638,
      foo: "bar",
      foobar: "foo"
    })).to.eql({
      foo: "bar",
      foobar: "foo"
    });
  });
});

describe("recordField", () => {
  let record;

  beforeEach(() => {
      record = {
        title: "I am a title",
        extras: {foo: "bar", foobar: "foo"},
        "faux.ami": "Yes I am",
        "supported.strange.nested": {"tree": "foobar"}
      };
  });
  
  it("should return the title field as a string", () => {
    expect(recordField("title", record)).to.eql("I am a title");
  });

  it("should return the extras field as a JSON string", () => {
    expect(recordField("extras", record)).to.eql('{"foo":"bar","foobar":"foo"}');
  });

  it("should return the extras.foo field as a string", () => {
    expect(recordField("extras.foo", record)).to.eql("bar");
  });

  it("should return the faux.ami field as a string", () => {
    expect(recordField("faux.ami", record)).to.eql("Yes I am");
  });

  it("should return unknown if the nested field wasn't found.", () => {
    expect(recordField("extras.unknown", record)).to.eql("<unknown>");
  });

  it("should return unknown if the field wasn't found.", () => {
    expect(recordField("unknown", record)).to.eql("<unknown>");
  });

  it("should return support strange nested tree.", () => {
    expect(recordField("supported.strange.nested.tree", record)).to.eql("foobar");
  });
});
