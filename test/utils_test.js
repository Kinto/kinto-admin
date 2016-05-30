import { expect } from "chai";

import {cleanRecord, renderDisplayField} from "../scripts/utils";

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

describe("renderDisplayField", () => {
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
    expect(renderDisplayField(record, "title")).to.eql("I am a title");
  });

  it("should return the extras field as a JSON string", () => {
    expect(renderDisplayField(record, "extras")).to.eql('{"foo":"bar","foobar":"foo"}');
  });

  it("should return the extras.foo field as a string", () => {
    expect(renderDisplayField(record, "extras.foo")).to.eql("bar");
  });

  it("should return the faux.ami field as a string", () => {
    expect(renderDisplayField(record, "faux.ami")).to.eql("Yes I am");
  });

  it("should return unknown if the nested field wasn't found.", () => {
    expect(renderDisplayField(record, "extras.unknown")).to.eql("<unknown>");
  });

  it("should return unknown if the field wasn't found.", () => {
    expect(renderDisplayField(record, "unknown")).to.eql("<unknown>");
  });

  it("should return support strange nested tree.", () => {
    expect(renderDisplayField(record, "supported.strange.nested.tree")).to.eql("foobar");
  });
});
