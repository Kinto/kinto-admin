import Base64File from "@src/components/rjsf/Base64File";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

const tinyTestImg =
  "data:image/bmp;base64,Qk2aAAAAAAAAAIoAAAB8AAAAAgAAAAIAAAABABgAAAAAABAAAAAjLgAAIy4AAAAAAAAAAAAAAAD/AAD/AAD/AAAAAAAAAEJHUnMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAA////AAAAAAAAAAD///8AAA==";
const tinyTestTxt = "data:text/plain;base64,aGkK"; // "hi"
const hugeTestTxt = `data:text/plain;base64,${"aGkK".repeat(1024 * 512)}`; // "hi" repeatedly

class fileReaderMock {
  error: FileReader["error"] = null;
  result: FileReader["result"] = null;
  addEventListener = vitest.fn();
  onloadend = {
    get() {
      return this._onloadend;
    },
    set(onloadend) {
      this._onloadend = onloadend;
    },
  };
  readAsDataURL = vitest.fn();
  removeEventListener = vitest.fn();
}

describe("Base64File rjsf component", () => {
  beforeAll(() => {
    let fileReader = new fileReaderMock();
    vitest.spyOn(global, "FileReader").mockImplementation(() => fileReader);
    fileReader.addEventListener.mockImplementation((_, fn) => fn());
    fileReader.readAsDataURL.mockImplementation(file => {
      fileReader.result = file;
      fileReader.onloadend();
    });
  });

  afterAll(() => {
    vitest.restoreAllMocks();
  });

  it("Should render a file input and an empty value when no value is provided", async () => {
    render(<Base64File />);
    expect(await screen.getByTestId("b64-file")).toBeDefined();
    expect(screen.queryByTitle("Remove existing value")).toBeNull();
    expect(screen.queryByTestId("b64-download")).toBeNull();
  });

  it("Should render an image when one the existing value is an image", async () => {
    render(<Base64File value={tinyTestImg} />);
    expect(await screen.getByTestId("b64-file")).toBeDefined();
    expect(await screen.getByTitle("Remove existing value")).toBeDefined();
    expect(await screen.getByTestId("b64-download")).toBeDefined();
    expect(
      await screen.getByTitle("Image preview, click to download")
    ).toBeDefined();
  });

  it("Should render a download link when the existing value is not an image", async () => {
    render(<Base64File value={tinyTestTxt} />);
    expect(await screen.getByTestId("b64-file")).toBeDefined();
    expect(await screen.getByTitle("Remove existing value")).toBeDefined();
    expect(await screen.getByTestId("b64-download")).toBeDefined();
    expect(await screen.getByTitle("Click to download")).toBeDefined();
  });

  it("Should update the value when a new file is uploaded", async () => {
    let val, errors;
    const changeMock = (v, e) => {
      val = v;
      errors = e;
    };
    render(<Base64File onChange={changeMock} />);
    fireEvent.change(await screen.getByTestId("b64-file"), {
      target: {
        files: [tinyTestImg],
      },
    });
    await waitFor(() => new Promise(resolve => setTimeout(resolve, 10))); // debounce wait
    expect(val).toBeDefined();
    expect(errors).toBeUndefined();
  });

  it("Should have a validation error when the uploaded file is too large", async () => {
    let val, errors;
    const changeMock = (v, e) => {
      val = v;
      errors = e;
    };
    render(<Base64File onChange={changeMock} />);
    fireEvent.change(await screen.getByTestId("b64-file"), {
      target: {
        files: [hugeTestTxt],
      },
    });
    await waitFor(() => new Promise(resolve => setTimeout(resolve, 10))); // debounce wait
    expect(val).toBeDefined();
    expect(errors).toBeDefined();
  });
});
