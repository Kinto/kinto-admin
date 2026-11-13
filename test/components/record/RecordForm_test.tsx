import * as client from "@src/client";
import RecordForm from "@src/components/record/RecordForm";
import * as collectionHooks from "@src/hooks/collection";
import * as recordHooks from "@src/hooks/record";
import * as sessionHooks from "@src/hooks/session";
import { canCreateRecord, canEditRecord } from "@src/permission";
import {
  SERVERINFO_WITH_ATTACHMENTS_CAPABILITY,
  renderWithRouter,
} from "@test/testUtils";
import { fireEvent, screen, waitFor } from "@testing-library/react";

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
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue({
      status: "success",
      data: SERVERINFO_WITH_ATTACHMENTS_CAPABILITY,
    });
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
    vi.spyOn(collectionHooks, "useCollection").mockReturnValueOnce(attachCol);
    renderWithRouter(<RecordForm />, createRouteProps);
    expect(screen.queryByLabelText("TestTitle").value).toBe("");
    expect(screen.queryByLabelText("TestContent").value).toBe("");
    expect(await screen.findByLabelText(/File attachment/)).toBeInTheDocument();
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
    expect(await screen.findByLabelText(/File attachment/)).toBeInTheDocument();
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

  const attachFile = async () => {
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    fireEvent.change(await screen.findByLabelText(/File attachment/), {
      target: { files: [file] },
    });
    await screen.findByText(/hello\.txt/);
  };

  it("Keeps the id from the form when creating a record with an attachment", async () => {
    lastSubmittedData = null;
    vi.spyOn(collectionHooks, "useCollection").mockReturnValue({
      ...attachCol,
      schema: {
        ...attachCol.schema,
        properties: {
          id: { type: "string", title: "TestId" },
          ...attachCol.schema.properties,
        },
      },
      uiSchema: {
        ...attachCol.uiSchema,
        "ui:order": ["id", "title", "content"],
      },
    });
    renderWithRouter(<RecordForm />, createRouteProps);
    fireEvent.change(screen.queryByLabelText("TestId"), {
      target: { value: "my-id" },
    });
    fireEvent.change(screen.queryByLabelText("TestTitle"), {
      target: { value: "test title" },
    });
    await attachFile();
    fireEvent.click(screen.queryByText("Create record"));
    await waitFor(() => expect(lastSubmittedData).not.toBeNull());
    expect(lastSubmittedData.fn).toBe("addAttachment");
    expect(lastSubmittedData.data).toStrictEqual({
      id: "my-id",
      title: "test title",
    });
  });

  it("Does not send an id when creating a record with an attachment without id field", async () => {
    lastSubmittedData = null;
    vi.spyOn(collectionHooks, "useCollection").mockReturnValue(attachCol);
    renderWithRouter(<RecordForm />, createRouteProps);
    fireEvent.change(screen.queryByLabelText("TestTitle"), {
      target: { value: "test title" },
    });
    await attachFile();
    fireEvent.click(screen.queryByText("Create record"));
    await waitFor(() => expect(lastSubmittedData).not.toBeNull());
    expect(lastSubmittedData.fn).toBe("addAttachment");
    expect(lastSubmittedData.data).toStrictEqual({ title: "test title" });
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
