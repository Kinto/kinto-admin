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
    })).eql({
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
      "supported.strange.nested": {"tree": "foobar", "tree.value": "bar"}
    };
  });
  
  it("should return the title field as a string", () => {
    expect(renderDisplayField(record, "title"))
      .eql("I am a title");
  });

  it("should return the extras field as a JSON string", () => {
    expect(renderDisplayField(record, "extras"))
      .eql(JSON.stringify({"foo": "bar", "foobar": "foo"}));
  });

  it("should return the extras.foo field as a string", () => {
    expect(renderDisplayField(record, "extras.foo"))
      .eql("bar");
  });

  it("should return the faux.ami field as a string", () => {
    expect(renderDisplayField(record, "faux.ami"))
      .eql("Yes I am");
  });

  it("should return unknown if the nested field wasn't found.", () => {
    expect(renderDisplayField(record, "extras.unknown"))
      .eql("<unknown>");
  });

  it("should return unknown if the field wasn't found.", () => {
    expect(renderDisplayField(record, "unknown"))
      .eql("<unknown>");
  });

  it("should return support strange nested tree.", () => {
    expect(renderDisplayField(record, "supported.strange.nested.tree"))
      .eql("foobar");
  });

  it("should return support strange nested tree value.", () => {
    expect(renderDisplayField(record, "supported.strange.nested.tree.value"))
      .eql("bar");
  });

  it("should return support strange nested tree value missing.", () => {
    expect(renderDisplayField(record, "supported.strange.nested.tree.missing"))
      .eql("<unknown>");
  });
});
