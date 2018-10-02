import { expect } from "chai";

import { createSandbox, createComponent } from "../test_utils";

import RecordAttributes from "../../src/components/record/RecordAttributes";

describe("RecordAttributes component", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const bucket = {
    id: "bucket",
    data: {},
    permissions: {
      read: [],
      write: [],
    },
  };

  const collection = {
    data: {
      schema: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          foo: {
            type: "string",
          },
        },
      },
      attachment: {
        enabled: true,
        required: false,
      },
    },
    permissions: {
      write: [],
    },
  };

  describe("Attachment info shown", () => {
    let node;

    const record = {
      data: {
        id: "abc",
        foo: "bar",
        attachment: {
          location: "path/file.png",
          mimetype: "image/png",
          size: 12345,
        },
      },
      permissions: {},
    };

    beforeEach(() => {
      node = createComponent(RecordAttributes, {
        match: { params: { bid: "bucket", cid: "collection", rid: "abc" } },
        session: { authenticated: true, serverInfo: { user: "plop" } },
        capabilities: { attachments: { base_url: "" } },
        bucket,
        collection,
        record,
        deleteRecord: () => {},
        deleteAttachment: () => {},
        updateRecord: () => {},
      });
    });

    it("should render the attachment info", () => {
      expect(node.querySelector(".attachment-info")).to.exist;
    });

    it("should show a delete attachment button", () => {
      expect(node.querySelector(".attachment-action .btn.btn-danger")).to.exist;
    });
  });
});
