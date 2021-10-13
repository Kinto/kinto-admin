import { expect } from "chai";
import sinon, { useFakeTimers } from "sinon";
import { Simulate } from "react-dom/test-utils";

import { createSandbox, createComponent } from "../test_utils";
import TagsField from "../../src/components/TagsField";

describe("TagsField component", () => {
  let clock, sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
    clock = useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
    clock.restore();
  });

  describe("Separator", () => {
    it('should use "," as a default separator', () => {
      const node = createComponent(TagsField, {
        schema: {},
        formData: ["a", "b", "c"],
      });

      expect(node.querySelector("input").value).eql("a, b, c");
    });

    it("should accept and use a custom separator", () => {
      const node = createComponent(TagsField, {
        schema: {},
        formData: ["a", "b", "c"],
        uiSchema: {
          "ui:options": { separator: ":" },
        },
      });

      expect(node.querySelector("input").value).eql("a: b: c");
    });

    it("should special case the space separator", () => {
      const node = createComponent(TagsField, {
        schema: {},
        formData: ["a", "b", "c"],
        uiSchema: {
          "ui:options": { separator: " " },
        },
      });

      expect(node.querySelector("input").value).eql("a b c");
    });
  });

  describe("Unique items", () => {
    it("should accept duplicates by default", () => {
      const node = createComponent(TagsField, {
        schema: {},
        formData: ["a", "b", "a"],
      });

      expect(node.querySelector("input").value).eql("a, b, a");
    });

    it("should drop duplicates with an uniqueItems enabled schema", () => {
      const onChange = sinon.spy();
      const node = createComponent(TagsField, {
        schema: { uniqueItems: true },
        formData: ["a", "b"],
        onChange,
      });

      Simulate.change(node.querySelector("input"), {
        target: { value: "a, b, a" },
      });
      clock.tick();
      sinon.assert.calledWithExactly(onChange, ["a", "b"]);
    });
  });
});
