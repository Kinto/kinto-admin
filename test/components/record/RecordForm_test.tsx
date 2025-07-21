import * as client from "@src/client";
import RecordForm from "@src/components/record/RecordForm";
import { SERVERINFO_WITH_ATTACHMENTS_CAPABILITY } from "@src/constants";
import * as collectionHooks from "@src/hooks/collection";
import * as recordHooks from "@src/hooks/record";
import * as sessionHooks from "@src/hooks/session";
import { canCreateRecord, canEditRecord } from "@src/permission";
import { renderWithRouter } from "@test/testUtils";
import { fireEvent, screen } from "@testing-library/react";
import React from "react";

vi.mock("@src/permission", () => {
  return {
    __esModule: true,
    canCreateRecord: vi.fn(),
    canEditRecord: vi.fn(),
  };
});

describe("RecordForm", () => {
  const defaultCol = {
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
  };

  const attachCol = {
    ...defaultCol,
    attachment: {
      enabled: true,
      required: true,
    },
  };

  const testAttachment = {
    hash: "efcea498c4bed6cac0076d91bf4f5df67fa875b3676248e5a6ae2ef4ed1bcef1",
    size: 5475,
    filename: "z.jpg",
    location: "test/test/03adc61f-9070-4e6c-a6ef-e94f5e17245f.jpg",
    mimetype: "image/jpeg",
  };

  let lastSubmittedData = null;
  const createRouteProps = {
    route: "/test/test",
    path: "/:bid/:cid",
  };

  const editRouteProps = {
    route: "/test/test/test",
    path: "/:bid/:cid/:rid",
  };

  beforeEach(() => {
    canCreateRecord.mockReturnValue(true);
    canEditRecord.mockReturnValue(true);
    vi.spyOn(recordHooks, "useRecord").mockReturnValue(undefined);
    vi.spyOn(collectionHooks, "useCollection").mockReturnValue(defaultCol);
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue(SERVERINFO_WITH_ATTACHMENTS_CAPABILITY);
    vi.spyOn(client, "getClient").mockReturnValue({
      bucket: bid => {
        return {
          collection: cid => {
            return {
              deleteRecord: (rid, opts) => {
                lastSubmittedData = {
                  fn: "delete",
                  rid,
                  opts,
                };
              },
              addAttachment: (attachment, data, opts) => {
                lastSubmittedData = {
                  fn: "addAttachment",
                  attachment,
                  data,
                  opts,
                };
              },
              updateRecord: (data, opts) => {
                lastSubmittedData = {
                  fn: "updateRecord",
                  data,
                  opts,
                };
              },
              createRecord: (data, opts) => {
                lastSubmittedData = {
                  fn: "createRecord",
                  data,
                  opts,
                };
              },
            };
          },
        };
      },
    });
  });

  it("Renders an empty form for a new record (attachments disabled)", async () => {
    renderWithRouter(<RecordForm />, createRouteProps);
    fireEvent.change(screen.queryByLabelText("TestTitle"), {
      target: { value: "test title" },
    });
    fireEvent.change(screen.queryByLabelText("TestContent"), {
      target: { value: "test content" },
    });
    fireEvent.click(screen.queryByText("Create record"));
    expect(lastSubmittedData).toStrictEqual({
      fn: "createRecord",
      data: {
        title: "test title",
        content: "test content",
      },
      opts: undefined,
    });
  });

  it("Renders the expected form for an existing record (attachments disabled)", async () => {
    vi.spyOn(recordHooks, "useRecord").mockReturnValueOnce({
      data: {
        title: "test title",
        content: "test content",
        id: "test",
      },
    });
    renderWithRouter(<RecordForm />, editRouteProps);
    expect(screen.queryByLabelText("TestTitle").value).toBe("test title");
    expect(screen.queryByLabelText("TestContent").value).toBe("test content");
  });

  it("Renders an empty form for a new record (attachments enabled)", async () => {
    renderWithRouter(<RecordForm />, createRouteProps);
    expect(screen.queryByLabelText("TestTitle").value).toBe("");
    expect(screen.queryByLabelText("TestContent").value).toBe("");
    expect(screen.findByLabelText("File attachment")).toBeDefined();
  });

  it("Renders the expected form for an existing record (attachments enabled) and allows user to save without updating attachment", async () => {
    vi.spyOn(collectionHooks, "useCollection").mockReturnValueOnce(attachCol);
    vi.spyOn(recordHooks, "useRecord").mockReturnValueOnce({
      data: {
        title: "test title",
        content: "test content",
        attachment: testAttachment,
        id: "test",
      },
    });
    renderWithRouter(<RecordForm />, editRouteProps);
    expect(screen.queryByLabelText("TestTitle").value).toBe("test title");
    expect(screen.queryByLabelText("TestContent").value).toBe("test content");
    expect(screen.findByLabelText("File attachment")).toBeDefined();
    fireEvent.change(screen.queryByLabelText("TestTitle"), {
      target: { value: "updated title" },
    });
    fireEvent.click(screen.queryByText("Update record"));
    expect(lastSubmittedData).toStrictEqual({
      fn: "updateRecord",
      data: {
        id: "test",
        title: "updated title",
        content: "test content",
        attachment: testAttachment,
      },
      opts: {
        safe: true,
      },
    });
  });

  it("Requires an attachment to submit when it's a new record and attachments are required", async () => {
    lastSubmittedData = null;
    vi.spyOn(collectionHooks, "useCollection").mockReturnValueOnce(attachCol);
    renderWithRouter(<RecordForm />, createRouteProps);
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
    vi.spyOn(collectionHooks, "useCollection").mockReturnValueOnce(attachCol);
    vi.spyOn(recordHooks, "useRecord").mockReturnValueOnce({
      data: {
        title: "test title",
        content: "test content",
        id: "test",
      },
    });
    renderWithRouter(<RecordForm />, editRouteProps);
    expect(screen.queryByLabelText("TestTitle").disabled).toBe(true);
    expect(screen.queryByLabelText("TestContent").disabled).toBe(true);
    expect(screen.queryByLabelText("File attachment").disabled).toBe(true);
  });
});
