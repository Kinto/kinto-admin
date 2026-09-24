import KintoFile from "@src/components/rjsf/KintoFile";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

const testMinFile = { name: "test.txt", size: "123", type: "text/plain" };

describe("KintoFile rjsf component", () => {
  afterAll(() => {
    vitest.restoreAllMocks();
  });

  it("Should render a file input and an empty value by default", async () => {
    render(<KintoFile title="File attachment test" />);
    expect(await screen.getByLabelText("File attachment test")).toBeDefined();
    expect(screen.queryByTitle("Remove existing value")).toBeNull();
  });

  it("Should call back to our change event with the expected rjsf object", async () => {
    let val, errors;
    const changeMock = (v, e) => {
      val = v;
      errors = e;
    };
    render(<KintoFile title="File attachment test" onChange={changeMock} />);
    fireEvent.change(await screen.getByLabelText("File attachment test"), {
      target: {
        files: [testMinFile],
      },
    });
    await waitFor(() => new Promise(resolve => setTimeout(resolve, 10))); // debounce wait
    expect(val).toStrictEqual({
      ...testMinFile,
      dataURL: "data:text/plain;base64,",
    });
    expect(errors).toBeUndefined();
  });

  it("Should render a file with a remove button when a file is selected, and allow a clear", async () => {
    let val, errors;
    const changeMock = (v, e) => {
      val = v;
      errors = e;
    };
    render(
      <KintoFile
        title="File attachment test"
        value={testMinFile}
        onChange={changeMock}
      />
    );
    fireEvent.click(screen.queryByTitle("Clear selected file"));
    await waitFor(() => new Promise(resolve => setTimeout(resolve, 10))); // debounce wait
    expect(val).toBeNull();
    expect(errors).toBeUndefined();
  });
});
