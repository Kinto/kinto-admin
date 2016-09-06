import { expect } from "chai";

import {
  cleanRecord,
  renderDisplayField,
  validateSchema,
  validateUiSchema,
} from "../src/utils";


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

describe("validateSchema()", () => {
  it("should validate that the schema is valid JSON", () => {
    expect(() => validateSchema("invalid"))
      .to.throw("The schema is not valid JSON");
  });

  it("should validate that the schema is an object", () => {
    expect(() => validateSchema("[]"))
      .to.throw("The schema is not an object");
  });

  it("should validate that the schema has a type property", () => {
    expect(() => validateSchema("{}"))
      .to.throw("The schema has no type");
  });

  it("should validate that the schema has an 'object' type", () => {
    expect(() => validateSchema(JSON.stringify({type: "string"})))
      .to.throw("The schema type is not 'object'");
  });

  it("should validate that the schema declare properties", () => {
    expect(() => validateSchema(JSON.stringify({type: "object"})))
      .to.throw("The schema has no 'properties' property");
  });

  it("should validate that the schema properties are an object", () => {
    expect(() => validateSchema(JSON.stringify({type: "object", properties: 2})))
      .to.throw("The 'properties' property is not an object");
  });

  it("should validate that the schema properties has properties", () => {
    expect(() => validateSchema(JSON.stringify({type: "object", properties: {}})))
      .to.throw("The 'properties' property object has no properties");
  });
});

describe("validateUiSchema()", () => {
  const schema = JSON.stringify({
    type: "object",
    properties: {
      foo: {type: "string"},
      bar: {type: "number"},
    }
  });

  it("should validate that the uiSchema is valid JSON", () => {
    expect(() => validateUiSchema("invalid", schema))
      .to.throw("The uiSchema is not valid JSON");
  });

  it("should validate that the uiSchema is an object", () => {
    expect(() => validateUiSchema("42", schema))
      .to.throw("The uiSchema is not an object");
  });

  it("should validate that a uiSchema 'ui:order' is an array", () => {
    expect(() => validateUiSchema(JSON.stringify({"ui:order": 42}), schema))
      .to.throw("The uiSchema ui:order directive isn't an array");
  });

  it("should validate that a uiSchema 'ui:order' match schema properties", () => {
    expect(() => validateUiSchema(JSON.stringify({"ui:order": []}), schema))
      .to.throw("The ui:order directive should list all schema properties");

    expect(() => validateUiSchema(JSON.stringify({"ui:order": ["foo", "bar", "baz"]}), schema))
      .to.throw("The ui:order directive should list all schema properties");

    const validUiSchema = JSON.stringify({"ui:order": ["foo", "bar"]});
    expect(validateUiSchema(validUiSchema, schema))
      .eql(JSON.parse(validUiSchema));
  });
});
