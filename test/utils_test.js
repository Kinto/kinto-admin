import { expect } from "chai";
import { ANONYMOUS_AUTH, DEFAULT_KINTO_SERVER } from "../src/constants";

import {
  capitalize,
  cleanRecord,
  diffJson,
  renderDisplayField,
  validateSchema,
  validateUiSchema,
  humanDate,
  buildAttachmentUrl,
  timeago,
  sortHistoryEntryPermissions,
  getServerByPriority,
} from "../src/utils";

describe("cleanRecord", () => {
  it("should remove id, schema, attachment and last_modified from properties", () => {
    expect(
      cleanRecord({
        id: "toto",
        last_modified: 1234,
        schema: 5638,
        foo: "bar",
        foobar: "foo",
        attachment: { location: "http://url " },
      })
    ).eql({
      foo: "bar",
      foobar: "foo",
    });
  });
});

describe("capitalize", () => {
  it("should put the first letter uppercase", () => {
    expect(capitalize("last_modified")).eql("Last Modified");
  });
});

describe("renderDisplayField", () => {
  let record;

  beforeEach(() => {
    record = {
      title: "I am a title",
      extras: { foo: "bar", foobar: "foo" },
      "faux.ami": "Yes I am",
      "supported.strange.nested": { tree: "foobar", "tree.value": "bar" },
    };
  });

  it("should return the title field as a string", () => {
    expect(renderDisplayField(record, "title")).eql("I am a title");
  });

  it("should return the extras field as a JSON string", () => {
    expect(renderDisplayField(record, "extras")).eql(
      JSON.stringify({ foo: "bar", foobar: "foo" })
    );
  });

  it("should return the extras.foo field as a string", () => {
    expect(renderDisplayField(record, "extras.foo")).eql("bar");
  });

  it("should return the faux.ami field as a string", () => {
    expect(renderDisplayField(record, "faux.ami")).eql("Yes I am");
  });

  it("should return unknown if the nested field wasn't found.", () => {
    expect(renderDisplayField(record, "extras.unknown")).eql("<unknown>");
  });

  it("should return unknown if the field wasn't found.", () => {
    expect(renderDisplayField(record, "unknown")).eql("<unknown>");
  });

  it("should return support strange nested tree.", () => {
    expect(renderDisplayField(record, "supported.strange.nested.tree")).eql(
      "foobar"
    );
  });

  it("should return support strange nested tree value.", () => {
    expect(
      renderDisplayField(record, "supported.strange.nested.tree.value")
    ).eql("bar");
  });

  it("should return support strange nested tree value missing.", () => {
    expect(
      renderDisplayField(record, "supported.strange.nested.tree.missing")
    ).eql("<unknown>");
  });
});

describe("validateSchema()", () => {
  it("should validate that the schema is valid JSON", () => {
    expect(() => validateSchema("invalid")).to.throw(
      "The schema is not valid JSON"
    );
  });

  it("should validate that the schema is an object", () => {
    expect(() => validateSchema("[]")).to.throw("The schema is not an object");
  });

  it("should validate that the schema has a type property", () => {
    expect(() => validateSchema("{}")).to.throw("The schema has no type");
  });

  it("should validate that the schema has an 'object' type", () => {
    expect(() => validateSchema(JSON.stringify({ type: "string" }))).to.throw(
      "The schema type is not 'object'"
    );
  });

  it("should validate that the schema declare properties", () => {
    expect(() => validateSchema(JSON.stringify({ type: "object" }))).to.throw(
      "The schema has no 'properties' property"
    );
  });

  it("should validate that the schema properties are an object", () => {
    expect(() =>
      validateSchema(JSON.stringify({ type: "object", properties: 2 }))
    ).to.throw("The 'properties' property is not an object");
  });

  it("should validate that the schema properties has properties", () => {
    expect(() =>
      validateSchema(JSON.stringify({ type: "object", properties: {} }))
    ).to.throw("The 'properties' property object has no properties");
  });
});

describe("validateUiSchema()", () => {
  const schema = JSON.stringify({
    type: "object",
    properties: {
      foo: { type: "string" },
      bar: { type: "number" },
    },
  });

  it("should validate that the uiSchema is valid JSON", () => {
    expect(() => validateUiSchema("invalid", schema)).to.throw(
      "The uiSchema is not valid JSON"
    );
  });

  it("should validate that the uiSchema is an object", () => {
    expect(() => validateUiSchema("42", schema)).to.throw(
      "The uiSchema is not an object"
    );
  });

  it("should validate that a uiSchema 'ui:order' is an array", () => {
    expect(() =>
      validateUiSchema(JSON.stringify({ "ui:order": 42 }), schema)
    ).to.throw("The uiSchema ui:order directive isn't an array");
  });

  it("should validate that a uiSchema 'ui:order' match schema properties", () => {
    expect(() =>
      validateUiSchema(JSON.stringify({ "ui:order": [] }), schema)
    ).to.throw("The ui:order directive should list all schema properties");

    expect(() =>
      validateUiSchema(
        JSON.stringify({ "ui:order": ["foo", "bar", "baz"] }),
        schema
      )
    ).to.throw("The ui:order directive should list all schema properties");

    const validUiSchema = JSON.stringify({ "ui:order": ["foo", "bar"] });
    expect(validateUiSchema(validUiSchema, schema)).eql(
      JSON.parse(validUiSchema)
    );
  });
});

describe("humanDate", () => {
  it("should format a string with zero to an English date string", () => {
    expect(humanDate("0")).eql("Thursday, January 1, 1970 at 12:00:00 AM UTC");
  });

  it("should format a last_modified string to an English date string", () => {
    expect(humanDate("1475851921581")).eql(
      "Friday, October 7, 2016 at 2:52:01 PM UTC"
    );
  });
});

describe("buildAttachmentUrl", () => {
  const capabilities = { attachments: {} };
  it("should return nothing if no attachment is part of the record", () => {
    expect(buildAttachmentUrl({ id: "abc" }, capabilities)).to.be.a(
      "undefined"
    );
  });

  it("should return nothing if the record attachment is incomplete", () => {
    expect(buildAttachmentUrl({ attachment: {} }, capabilities)).to.be.a(
      "undefined"
    );
  });

  it("should return nothing if the attachments capability isn't enabled", () => {
    expect(
      buildAttachmentUrl(
        { id: "abc", attachment: { location: "http://" } },
        { history: {} }
      )
    ).to.be.a("undefined");
  });

  it("should build an attachment url from the capability config", () => {
    expect(
      buildAttachmentUrl(
        { attachment: { location: "/file" } },
        { attachments: { base_url: "http://cdn" } }
      )
    ).eql("http://cdn/file");
  });

  it("should return attachment location if it's already an http url", () => {
    expect(
      buildAttachmentUrl(
        { attachment: { location: "http://cdn/file" } },
        { attachments: {} }
      )
    ).eql("http://cdn/file");
  });

  it("should build an attachment url from the capability config", () => {
    expect(
      buildAttachmentUrl(
        { attachment: { location: "/file" } },
        { attachments: { base_url: "http://cdn" } }
      )
    ).eql("http://cdn/file");
  });

  it("should ensure a valid url is built", () => {
    expect(
      buildAttachmentUrl(
        { attachment: { location: "file" } },
        { attachments: { base_url: "http://cdn" } }
      )
    ).eql("http://cdn/file");
    expect(
      buildAttachmentUrl(
        { attachment: { location: "/file" } },
        { attachments: { base_url: "http://cdn/" } }
      )
    ).eql("http://cdn/file");
  });
});

describe("timeago", function () {
  it("should convert a timestamp", () => {
    const now = new Date().getTime();
    expect(timeago(now - 86400000, now)).eql("1 day ago");
  });

  it("should prevent rendering future events", () => {
    const now = new Date().getTime();
    expect(timeago(now + 86400000, now)).eql("just now");
  });
});

describe("sortHistoryEntryPermissions()", () => {
  it("should sort permissions", () => {
    const entry = {
      action: "update",
      target: {
        permissions: {
          write: ["b", "c", "a"],
          read: ["c", "a", "b"],
        },
      },
    };
    expect(sortHistoryEntryPermissions(entry)).eql({
      action: "update",
      target: {
        permissions: {
          write: ["a", "b", "c"],
          read: ["a", "b", "c"],
        },
      },
    });
  });

  it("should not process tombstones", () => {
    const entry = {
      action: "delete",
      target: {
        id: "x",
        deleted: true,
      },
    };
    expect(sortHistoryEntryPermissions(entry)).eql(entry);
  });
});

describe("diffJson", function () {
  it("should return diff as string lines", () => {
    const diff = diffJson({ x: 0, a: 1, b: 2 }, { x: 0, a: 1, b: 3 });
    expect(diff).eql([
      '  {\n    "a": 1,',
      '-   "b": 2,',
      '+   "b": 3,',
      '    "x": 0\n  }',
    ]);
  });

  it("should truncate identical lines on first and last chunks", () => {
    const a = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9 };
    const b = { ...a, e: "1" };
    const diff = diffJson(a, b);
    expect(diff).eql([
      '  ...\n    "b": 2,\n    "c": 3,\n    "d": 4,',
      '-   "e": 5,',
      '+   "e": "1",',
      '    "f": 6,\n    "g": 7,\n    "h": 8,\n  ...',
    ]);
  });

  it("should not truncate if first or last is smaller than context", () => {
    const a = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9 };
    const b = { ...a, d: "d", f: "f" };
    const diff = diffJson(a, b);
    expect(diff).eql([
      '  {\n    "a": 1,\n    "b": 2,\n    "c": 3,',
      '-   "d": 4,',
      '+   "d": "d",',
      '    "e": 5,',
      '-   "f": 6,',
      '+   "f": "f",',
      '    "g": 7,\n    "h": 8,\n    "i": 9\n  }',
    ]);
  });

  it("should not truncate if smaller than context", () => {
    const a = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9 };
    const b = { ...a, b: "b", g: "h" };
    const diff = diffJson(a, b);
    expect(diff).eql([
      '  {\n    "a": 1,',
      '-   "b": 2,',
      '+   "b": "b",',
      '    "c": 3,\n    "d": 4,\n    "e": 5,\n    "f": 6,',
      '-   "g": 7,',
      '+   "g": "h",',
      '    "h": 8,\n    "i": 9\n  }',
    ]);
  });

  it("should truncate identical lines on middle chunks", () => {
    const a = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9 };
    const b = { ...a, a: "a", i: "i" };
    const diff = diffJson(a, b);
    expect(diff).eql([
      "  {",
      '-   "a": 1,',
      '+   "a": "a",',
      '    "b": 2,\n    "c": 3,\n    "d": 4,\n  ...\n    "f": 6,\n    "g": 7,\n    "h": 8,',
      '-   "i": 9',
      '+   "i": "i"',
      "  }",
    ]);
  });

  it("should not truncate diff chunks", () => {
    const a = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9 };
    const b = {};
    const diff = diffJson(a, b);
    expect(diff).eql([
      '- {\n-   "a": 1,\n-   "b": 2,\n-   "c": 3,\n-   "d": 4,\n-   "e": 5,\n-   "f": 6,\n-   "g": 7,\n-   "h": 8,\n-   "i": 9\n- }',
      "+ {}",
    ]);
  });

  it("should not truncate if context is 'all'", () => {
    const a = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
      f: 6,
      g: 7,
      h: 8,
      i: 9,
      j: 10,
      k: 11,
      l: 12,
    };
    const b = { ...a, f: "f", h: "h" };
    const diff = diffJson(a, b, "all");
    expect(diff).eql([
      '  {\n    "a": 1,\n    "b": 2,\n    "c": 3,\n    "d": 4,\n    "e": 5,',
      '-   "f": 6,',
      '+   "f": "f",',
      '    "g": 7,',
      '-   "h": 8,',
      '+   "h": "h",',
      '    "i": 9,\n    "j": 10,\n    "k": 11,\n    "l": 12\n  }',
    ]);
  });
});

describe("getServerByPriority", () => {
  const servers = [
    { server: "someServer", authType: ANONYMOUS_AUTH },
    { server: "otherServer", authType: ANONYMOUS_AUTH },
  ];
  beforeEach(() => {
    jest.resetModules();
  });
  it("should return SINGLE_SERVER", () => {
    jest.doMock("../src/constants", () => {
      const actual = jest.requireActual("../src/constants");
      return {
        __esModule: true,
        ...actual,
        SINGLE_SERVER: "http://www.example.com/",
      };
    });
    const {
      getServerByPriority: _getServerByPriority,
    } = require("../src/utils");
    expect(_getServerByPriority(servers)).eql("http://www.example.com/");
  });
  it("should return the first server from the array", () => {
    const server = getServerByPriority(servers);
    expect(server).eql("someServer");
  });
  it("should return the default server", () => {
    const server = getServerByPriority([]);
    expect(server).eql(DEFAULT_KINTO_SERVER);
  });
});
