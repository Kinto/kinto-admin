import TagsField from "@src/components/TagsField";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

describe("TagsField component", () => {
  describe("Unique items", () => {
    it("should accept duplicates by default", () => {
      const props = {
        schema: { title: "test-label" },
        formData: ["a", "b", "a"],
        fieldPathId: {
          path: "foo",
        },
      };
      render(<TagsField {...props} />);

      expect(screen.getByLabelText("test-label").value).toBe("a, b, a");
    });

    it("should drop duplicates with an uniqueItems enabled schema", () => {
      const onChange = vi.fn();
      const props = {
        schema: { uniqueItems: true, title: "test-label" },
        formData: ["a", "b"],
        onChange,
        fieldPathId: {
          path: "foo",
        },
      };
      render(<TagsField {...props} />);

      fireEvent.change(screen.getByLabelText("test-label"), {
        target: { value: "a, b, a" },
      });
      expect(onChange).toHaveBeenCalledWith(["a", "b"], "foo");
    });
  });
});
