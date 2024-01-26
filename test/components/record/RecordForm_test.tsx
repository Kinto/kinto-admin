import RecordForm from "@src/components/record/RecordForm";
import { canCreateRecord, canEditRecord } from "@src/permission";
import { renderWithProvider } from "@test/testUtils";
import { fireEvent, screen } from "@testing-library/react";
import React from "react";

vi.mock("../../../src/permission", () => {
  return {
    __esModule: true,
    canCreateRecord: vi.fn(),
    canEditRecord: vi.fn(),
  };
});

describe("RecordForm", () => {
  beforeEach(() => {
    canCreateRecord.mockReturnValue(true);
    canEditRecord.mockReturnValue(true);
  });
  let lastSubmittedData = null;

  const submitMock = data => {
    lastSubmittedData = data;
  };

  const defaultProps = {
    bid: "test",
    cid: "test",
    bucket: { data: { id: "test" } },
    collection: {
      data: {
        schema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              title: "TestTitle",
              description: "Title description...",
            },
            content: {
              type: "string",
              title: "TestContent",
              description: "Content description...",
            },
          },
        },
        uiSchema: {
          content: {
            "ui:widget": "textarea",
          },
          "ui:order": ["title", "content"],
        },
        attachment: {
          enabled: false,
          required: false,
        },
      },
    },
    deleteRecord: vi.fn(),
    deleteAttachment: vi.fn(),
    onSubmit: submitMock,
    capabilities: {},
  };

  const attachProps = {
    ...defaultProps,
    collection: {
      data: {
        ...defaultProps.collection.data,
        attachment: {
          enabled: true,
          required: true,
        },
      },
    },
  };

  const testAttachment = {
    hash: "efcea498c4bed6cac0076d91bf4f5df67fa875b3676248e5a6ae2ef4ed1bcef1",
    size: 5475,
    filename: "z.jpg",
    location: "test/test/03adc61f-9070-4e6c-a6ef-e94f5e17245f.jpg",
    mimetype: "image/jpeg",
  };

  it("Renders an empty form for a new record (attachments disabled)", async () => {
    renderWithProvider(<RecordForm {...defaultProps} />);
    fireEvent.change(screen.queryByLabelText("TestTitle"), {
      target: { value: "test title" },
    });
    fireEvent.change(screen.queryByLabelText("TestContent"), {
      target: { value: "test content" },
    });
    fireEvent.click(screen.queryByText("Create record"));
    expect(lastSubmittedData).toStrictEqual({
      title: "test title",
      content: "test content",
    });
  });

  it("Renders the expected form for an existing record (attachments disabled)", async () => {
    renderWithProvider(
      <RecordForm
        {...defaultProps}
        record={{
          data: {
            title: "test title",
            content: "test content",
          },
        }}
      />
    );
    expect(screen.queryByLabelText("TestTitle").value).toBe("test title");
    expect(screen.queryByLabelText("TestContent").value).toBe("test content");
  });

  it("Renders an empty form for a new record (attachments enabled)", async () => {
    renderWithProvider(<RecordForm {...attachProps} />);
    expect(screen.queryByLabelText("TestTitle").value).toBe("");
    expect(screen.queryByLabelText("TestContent").value).toBe("");
    expect(screen.findByLabelText("File attachment")).toBeDefined();
  });

  it("Renders the expected form for an existing record (attachments enabled) and allows user to save without updating attachment", async () => {
    renderWithProvider(
      <RecordForm
        {...attachProps}
        record={{
          data: {
            title: "test title",
            content: "test content",
            attachment: testAttachment,
          },
        }}
      />
    );
    expect(screen.queryByLabelText("TestTitle").value).toBe("test title");
    expect(screen.queryByLabelText("TestContent").value).toBe("test content");
    expect(screen.findByLabelText("File attachment")).toBeDefined();
    fireEvent.change(screen.queryByLabelText("TestTitle"), {
      target: { value: "updated title" },
    });
    fireEvent.click(screen.queryByText("Update record"));
    expect(lastSubmittedData).toStrictEqual({
      title: "updated title",
      content: "test content",
      attachment: testAttachment,
    });
  });

  it("Requires an attachment to submit when it's a new record and attachments are required", async () => {
    lastSubmittedData = null;
    renderWithProvider(<RecordForm {...attachProps} />);
    fireEvent.change(screen.queryByLabelText("TestTitle"), {
      target: { value: "test title" },
    });
    fireEvent.change(screen.queryByLabelText("TestContent"), {
      target: { value: "test content" },
    });
    fireEvent.click(screen.queryByText("Create record"));
    expect(lastSubmittedData).toBeNull();
  });

  it("Disables the form when user cannot edit", async () => {
    canEditRecord.mockReturnValue(false);
    renderWithProvider(
      <RecordForm
        {...attachProps}
        record={{
          data: {
            title: "test title",
            content: "test content",
          },
        }}
      />
    );
    expect(screen.queryByLabelText("TestTitle").disabled).toBe(true);
    expect(screen.queryByLabelText("TestContent").disabled).toBe(true);
    expect(screen.queryByLabelText("File attachment*").disabled).toBe(true);
  });
});
