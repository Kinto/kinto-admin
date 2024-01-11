import React from "react";
import { render, fireEvent } from "@testing-library/react";
import TagsField from "../../src/components/TagsField";

describe("TagsField component", () => {
  describe("Unique items", () => {
    it("should accept duplicates by default", () => {
      const props = {
        schema: { title: "test-label" },
        formData: ["a", "b", "a"],
      };
      const node = render(<TagsField {...props} />);

      expect(node.getByLabelText("test-label").value).toBe("a, b, a");
    });

    it("should drop duplicates with an uniqueItems enabled schema", () => {
      const onChange = jest.fn();
      const props = {
        schema: { uniqueItems: true, title: "test-label" },
        formData: ["a", "b"],
        onChange,
      };
      const node = render(<TagsField {...props} />);

      fireEvent.change(node.getByLabelText("test-label"), {
        target: { value: "a, b, a" },
      });
      expect(onChange).toHaveBeenCalledWith(["a", "b"]);
    });
  });
});
