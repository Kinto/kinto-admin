import JSONRecordForm from "@src/components/record/JSONRecordForm";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

const testAttachment = {
  hash: "efcea498c4bed6cac0076d91bf4f5df67fa875b3676248e5a6ae2ef4ed1bcef1",
  size: 5475,
  filename: "z.jpg",
  location: "test/test/03adc61f-9070-4e6c-a6ef-e94f5e17245f.jpg",
  mimetype: "image/jpeg",
};

function getCodeMirrorValue(container) {
  const lines = Array.from(container.querySelectorAll(".cm-line"))
    .map(el => el.textContent)
    .filter(Boolean);
  return lines.join("\n");
}

describe("JSONRecordForm", () => {
  let lastSubmittedData = null;
  const submitMock = data => {
    lastSubmittedData = data;
  };

  it("Renders an empty form for a new record (attachments disabled)", async () => {
    const { container } = render(
      <JSONRecordForm disabled={false} record="{}" onSubmit={submitMock} />
    );
    const value = getCodeMirrorValue(container);

    expect(value).toBe("{}");
    fireEvent.click(screen.queryByText("Submit"));
    expect(lastSubmittedData.formData).toStrictEqual({});
  });

  it("Renders the expected form for an existing record (attachments disabled)", async () => {
    const { container } = render(
      <JSONRecordForm
        disabled={false}
        record='{ "foo": "bar" }'
        onSubmit={submitMock}
      />
    );
    const value = getCodeMirrorValue(container);

    expect(value).toBe('{ "foo": "bar" }');
    fireEvent.click(screen.queryByText("Submit"));
    expect(lastSubmittedData.formData).toStrictEqual({ foo: "bar" });
  });

  it("Renders an empty form for a new record (attachments enabled)", async () => {
    const { container } = render(
      <JSONRecordForm
        disabled={false}
        record="{}"
        onSubmit={submitMock}
        attachmentEnabled={true}
      />
    );
    const value = getCodeMirrorValue(container);

    expect(value).toBe("{}");
    expect(screen.queryByLabelText("File attachment")).toBeDefined();
    fireEvent.click(screen.queryByText("Submit"));
    expect(lastSubmittedData.formData).toStrictEqual({
      attachment: undefined,
      __attachment__: undefined,
    });
  });

  it("Renders the expected form for an existing record (attachments enabled)", async () => {
    const { container } = render(
      <JSONRecordForm
        disabled={false}
        record='{ "foo": "bar" }'
        onSubmit={submitMock}
        attachmentEnabled={true}
      />
    );
    const value = getCodeMirrorValue(container);

    expect(value).toBe('{\n  "foo": "bar"\n}');
    expect(screen.queryByLabelText("File attachment")).toBeDefined();
    fireEvent.click(screen.queryByText("Submit"));
    expect(lastSubmittedData.formData).toStrictEqual({
      foo: "bar",
      attachment: undefined,
      __attachment__: undefined,
    });
  });

  it("Returns the previous attachment data when updating an existing record and not changing the attachment", async () => {
    const { container } = render(
      <JSONRecordForm
        disabled={false}
        record={JSON.stringify({
          foo: "bar",
          attachment: testAttachment,
        })}
        onSubmit={submitMock}
        attachmentEnabled={true}
      />
    );
    const value = getCodeMirrorValue(container);

    expect(value).toBe('{\n  "foo": "bar"\n}');
    expect(screen.queryByLabelText("File attachment")).toBeDefined();
    fireEvent.click(screen.queryByText("Submit"));
    expect(lastSubmittedData.formData).toStrictEqual({
      foo: "bar",
      attachment: testAttachment,
      __attachment__: undefined,
    });
  });

  it("Requires an attachment to submit when told attachmentRequired and attachmentEnabled are true", async () => {
    lastSubmittedData = null;
    const { container } = render(
      <JSONRecordForm
        disabled={false}
        record='{ "foo": "bar" }'
        onSubmit={submitMock}
        attachmentEnabled={true}
        attachmentRequired={true}
      />
    );
    const value = getCodeMirrorValue(container);

    expect(value).toBe('{\n  "foo": "bar"\n}');
    expect(screen.queryByLabelText("File attachment")).toBeDefined();
    fireEvent.click(screen.queryByText("Submit"));
    expect(lastSubmittedData).toBeNull();
  });

  it("Disables the form when disabled is true", async () => {
    const { container } = render(
      <JSONRecordForm
        disabled={true}
        record='{ "foo": "bar" }'
        onSubmit={submitMock}
      />
    );
    const value = container.querySelector("pre").textContent;
    expect(value).toBe('{ "foo": "bar" }');
    expect(screen.queryByText("Submit").disabled).toBe(true);
  });
});
