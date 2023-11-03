import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { CommentDialog } from "../../../src/components/signoff/Comment";

describe("Signoff CommentDialog component", () => {
  it("Should render the comment and function expected", async () => {
    const testProps = {
      description: "test description",
      confirmLabel: "cOnFiRm",
      onConfirm: jest.fn(),
      onCancel: jest.fn(),
    };

    // should be rendered correctly
    const result = render(<CommentDialog {...testProps} />);
    expect(await result.findByText(testProps.description)).toBeDefined();
    const confirm = await result.findByText(testProps.confirmLabel);
    expect(confirm).toBeDefined();
    const cancel = await result.findByText("Close");
    expect(result.queryByTestId("spinner")).toBeNull();

    // cancel button should call cancel event
    expect(testProps.onCancel).toBeCalledTimes(0);
    fireEvent.click(cancel);
    expect(testProps.onCancel).toBeCalledTimes(1);
    expect(result.queryByTestId("spinner")).toBeNull();

    // confirm button should call confirm event and show a spinner
    expect(testProps.onConfirm).toBeCalledTimes(0);
    fireEvent.click(confirm);
    expect(testProps.onConfirm).toBeCalledTimes(1);
    expect(result.queryByTestId("spinner")).toBeDefined();
  });
});
