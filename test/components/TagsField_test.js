import React from "react";
import { render, fireEvent } from "@testing-library/react";
import TagsField from "../../src/components/TagsField";

describe("TagsField component", () => {
  describe("Separator", () => {
    it('should use "," as a default separator', () => {
      const props = {
        schema: {},
        formData: ["a", "b", "c"],
      };
      const node = render(<TagsField {...props} />);

      expect(node.container.querySelector("input").value).toBe("a, b, c");
    });

    it("should accept and use a custom separator", () => {
      const props = {
        schema: {},
        formData: ["a", "b", "c"],
        uiSchema: {
          "ui:options": { separator: ":" },
        },
      };
      const node = render(<TagsField {...props} />);

      expect(node.container.querySelector("input").value).toBe("a: b: c");
    });

    it("should special case the space separator", () => {
      const props = {
        schema: {},
        formData: ["a", "b", "c"],
        uiSchema: {
          "ui:options": { separator: " " },
        },
      };
      const node = render(<TagsField {...props} />);

      expect(node.container.querySelector("input").value).toBe("a b c");
    });
  });

  describe("Unique items", () => {
    it("should accept duplicates by default", () => {
      const props = {
        schema: {},
        formData: ["a", "b", "a"],
      };
      const node = render(<TagsField {...props} />);

      expect(node.container.querySelector("input").value).toBe("a, b, a");
    });

    it("should drop duplicates with an uniqueItems enabled schema", () => {
      const onChange = jest.fn();
      const props = {
        schema: { uniqueItems: true },
        formData: ["a", "b"],
        onChange,
      };
      const node = render(<TagsField {...props} />);

      fireEvent.change(node.container.querySelector("input"), {
        target: { value: "a, b, a" },
      });
      expect(onChange).toHaveBeenCalledWith(["a", "b"]);
    });
  });
});
