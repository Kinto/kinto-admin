import Base64File from "@src/components/rjsf/Base64File";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

const tinyTestImg =
  "data:image/bmp;base64,Qk2aAAAAAAAAAIoAAAB8AAAAAgAAAAIAAAABABgAAAAAABAAAAAjLgAAIy4AAAAAAAAAAAAAAAD/AAD/AAD/AAAAAAAAAEJHUnMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAA////AAAAAAAAAAD///8AAA==";
const tinyTestTxt = "data:text/plain;base64,aGkK"; // "hi"
const hugeTestTxt = `data:text/plain;base64,${"aGkK".repeat(1024 * 512)}`; // "hi" repeatedly

// helper function to take the above encoded strings and turn them into blobs
function b64ToBlob(b64str) {
  const [typeStr, b64] = b64str.split(",");
  const type = typeStr.replace(/^data:/, "").replace(/;base64$/, "");
  const data = atob(b64);
  const b64Nums = new Array(data.length);
  for (let i = 0; i < b64Nums.length; i++) {
    b64Nums[i] = data.charCodeAt(i);
  }
  const bytes = new Uint8Array(b64Nums);
  return new Blob([bytes], {
    type,
  });
}

describe("Base64File rjsf component", () => {
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
        files: [b64ToBlob(tinyTestImg)],
      },
    });
    await waitFor(() => new Promise(resolve => setTimeout(resolve, 10))); // debounce wait
    expect(val).toBe(tinyTestImg);
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
        files: [b64ToBlob(hugeTestTxt)],
      },
    });
    await waitFor(() => new Promise(resolve => setTimeout(resolve, 10))); // debounce wait
    expect(val).toBe(hugeTestTxt);
    expect(errors).toBeDefined();
    expect(errors.__errors[0]).toBe(
      "The base64 string cannot exceed 1MB in size."
    );
  });
});
