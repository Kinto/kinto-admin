import { CommentDialog } from "../../../src/components/signoff/Comment";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

describe("Signoff CommentDialog component", () => {
  it("Should render the comment and function expected", async () => {
    const testProps = {
      description: "test description",
      confirmLabel: "cOnFiRm",
      onConfirm: vi.fn(),
      onClose: vi.fn(),
    };

    // should be rendered correctly
    render(<CommentDialog {...testProps} />);
    expect(await screen.findByText(testProps.description)).toBeDefined();
    const confirm = await screen.findByText(testProps.confirmLabel);
    expect(confirm).toBeDefined();
    const cancel = await screen.findByText("Close");
    expect(screen.queryByTestId("spinner")).toBeNull();

    // cancel button should call cancel event
    expect(testProps.onClose).toBeCalledTimes(0);
    fireEvent.click(cancel);
    expect(testProps.onClose).toBeCalledTimes(1);
    expect(screen.queryByTestId("spinner")).toBeNull();

    // confirm button should call confirm event and show a spinner
    expect(testProps.onConfirm).toBeCalledTimes(0);
    fireEvent.click(confirm);
    expect(testProps.onConfirm).toBeCalledTimes(1);
    expect(screen.queryByTestId("spinner")).toBeDefined();
  });
});
