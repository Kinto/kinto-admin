import PerRecordDiffView, {
  ChangeType,
  findChangeTypes,
  formatDiffHeader,
} from "@src/components/signoff/SimpleReview/PerRecordDiffView";
import { DEFAULT_SERVERINFO } from "@src/constants";
import * as sessionHooks from "@src/hooks/session";
import { fireEvent, render, screen, within } from "@testing-library/react";

function renderSimpleReview(props = null) {
  const mergedProps = {
    oldRecords: [],
    newRecords: [],
    ...props,
  };
  return render(<PerRecordDiffView {...mergedProps} />);
}

describe("PerRecordDiffView component", () => {
  it("should render diffs", () => {
    renderSimpleReview({
      oldRecords: [{ id: "foo" }, { id: "bar" }],
      newRecords: [{ id: "foo" }, { id: "baz" }],
    });
    expect(screen.queryAllByTestId("record-diff")).toHaveLength(2);
  });

  it("should render per-record diffs", () => {
    renderSimpleReview({
      oldRecords: [{ id: "foo" }],
      newRecords: [{ id: "foo" }, { id: "bar" }],
    });
    expect(screen.queryAllByTestId("record-diff")).toHaveLength(1);
  });

  it("should show a message when there are no differences", () => {
    renderSimpleReview({
      oldRecords: [{ id: "foo", last_modified: 1 }],
      newRecords: [{ id: "foo", last_modified: 2 }],
    });
    expect(screen.queryAllByTestId("record-diff")).toHaveLength(0);
    expect(screen.getByText("No differences found.")).toBeInTheDocument();
  });
});

describe("PerRecordDiffView attachment diff", () => {
  function attachment(location, hash, filename = "list.txt", size = 100) {
    return { location, hash, filename, size, mimetype: "text/plain" };
  }

  const oldRecord = { id: "foo", attachment: attachment("old.txt", "aaa") };
  const newRecord = { id: "foo", attachment: attachment("new.txt", "bbb") };

  function mockCapabilities(admin) {
    vi.spyOn(sessionHooks, "useServerInfo").mockReturnValue({
      status: "success",
      data: {
        ...DEFAULT_SERVERINFO,
        capabilities: {
          admin,
          attachments: { base_url: "https://cdn.example.com/" },
        },
      },
    });
  }

  function stubAttachments(oldText: string, newText: string) {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async url => new Response(url.endsWith("old.txt") ? oldText : newText)
      )
    );
  }

  beforeEach(() => {
    mockCapabilities({ csp_connect_src: ["https://cdn.example.com"] });
  });

  function attachmentLines(role: "insertion" | "deletion") {
    return within(screen.getByTestId("attachment-diff"))
      .queryAllByRole(role)
      .map(el => el.textContent.trim());
  }

  it("is hidden when the CSP doesn't allow the attachments origin", () => {
    mockCapabilities({});
    renderSimpleReview({ oldRecords: [oldRecord], newRecords: [newRecord] });
    expect(screen.getByTestId("record-diff")).toBeInTheDocument();
    expect(
      screen.queryByText("Compare attachment contents")
    ).not.toBeInTheDocument();
  });

  it("fetches and diffs text attachments on click", async () => {
    stubAttachments("a\nb\n", "a\nc\n");
    renderSimpleReview({ oldRecords: [oldRecord], newRecords: [newRecord] });
    expect(fetch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Compare attachment contents"));

    await screen.findByText("c");
    expect(attachmentLines("deletion")).toEqual(["b"]);
    expect(attachmentLines("insertion")).toEqual(["c"]);
    expect(fetch).toHaveBeenCalledWith("https://cdn.example.com/old.txt");
    expect(fetch).toHaveBeenCalledWith("https://cdn.example.com/new.txt");
  });

  it("starts over when the attachments change", async () => {
    stubAttachments("a\nb\n", "a\nc\n");
    const { rerender } = renderSimpleReview({
      oldRecords: [oldRecord],
      newRecords: [newRecord],
    });
    fireEvent.click(screen.getByText("Compare attachment contents"));
    await screen.findByText("c");

    const newerRecord = {
      id: "foo",
      attachment: attachment("newer.txt", "ccc"),
    };
    rerender(
      <PerRecordDiffView oldRecords={[oldRecord]} newRecords={[newerRecord]} />
    );

    expect(screen.queryByTestId("attachment-diff")).not.toBeInTheDocument();
    expect(screen.getByText("Compare attachment contents")).toBeInTheDocument();
  });

  it("can be closed and opened again without refetching", async () => {
    stubAttachments("a\nb\n", "a\nc\n");
    renderSimpleReview({ oldRecords: [oldRecord], newRecords: [newRecord] });
    fireEvent.click(screen.getByText("Compare attachment contents"));
    await screen.findByText("c");

    fireEvent.click(screen.getByText("Compare attachment contents"));
    expect(screen.getByTestId("attachment-diff")).not.toBeVisible();

    fireEvent.click(screen.getByText("Compare attachment contents"));
    expect(screen.getByTestId("attachment-diff")).toBeVisible();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("says so when the contents are the same", async () => {
    stubAttachments("same\n", "same\n");
    renderSimpleReview({ oldRecords: [oldRecord], newRecords: [newRecord] });

    fireEvent.click(screen.getByText("Compare attachment contents"));

    expect(
      await screen.findByText("No differences in attachment contents.")
    ).toBeInTheDocument();
  });

  it("shows the error and links when fetching fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 404 }))
    );
    renderSimpleReview({ oldRecords: [oldRecord], newRecords: [newRecord] });

    fireEvent.click(screen.getByText("Compare attachment contents"));

    expect(
      await screen.findByText(/Could not fetch attachment contents/)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "old" })).toHaveAttribute(
      "href",
      "https://cdn.example.com/old.txt"
    );
  });

  it("doesn't offer to compare attachments over 5MB", () => {
    renderSimpleReview({
      oldRecords: [oldRecord],
      newRecords: [
        {
          id: "foo",
          attachment: attachment("new.txt", "bbb", "list.txt", 6e6),
        },
      ],
    });

    expect(screen.getByText(/too large to compare/)).toBeInTheDocument();
    expect(
      screen.queryByText("Compare attachment contents")
    ).not.toBeInTheDocument();
  });

  it("shows links for non-text attachments", () => {
    renderSimpleReview({
      oldRecords: [
        { id: "foo", attachment: attachment("old.bin", "aaa", "data.bin") },
      ],
      newRecords: [
        { id: "foo", attachment: attachment("new.bin", "bbb", "data.bin") },
      ],
    });

    expect(screen.getByText(/can't be compared/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "new" })).toHaveAttribute(
      "href",
      "https://cdn.example.com/new.bin"
    );
  });
});

describe("findChangeTypes", () => {
  it("should find added items", () => {
    expect(
      findChangeTypes([{ id: "a" }], [{ id: "a" }, { id: "b" }])
    ).toStrictEqual([
      { id: "b", changeType: ChangeType.ADD, target: { id: "b" } },
    ]);
  });

  it("should find removed items", () => {
    expect(
      findChangeTypes([{ id: "a" }, { id: "b" }], [{ id: "a" }])
    ).toStrictEqual([
      { id: "b", changeType: ChangeType.REMOVE, source: { id: "b" } },
    ]);
  });

  it("should find multiple removed items", () => {
    expect(
      findChangeTypes(
        [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }],
        [{ id: "a" }]
      )
    ).toStrictEqual([
      { id: "b", changeType: ChangeType.REMOVE, source: { id: "b" } },
      { id: "c", changeType: ChangeType.REMOVE, source: { id: "c" } },
      { id: "d", changeType: ChangeType.REMOVE, source: { id: "d" } },
    ]);
  });

  it("should find updated items", () => {
    expect(
      findChangeTypes(
        [{ id: "a", text: "hello", last_modified: 123 }],
        [{ id: "a", text: "world", last_modified: 456 }]
      )
    ).toStrictEqual([
      {
        id: "a",
        changeType: ChangeType.UPDATE,
        source: { id: "a", text: "hello", last_modified: 123 },
        target: { id: "a", text: "world", last_modified: 456 },
      },
    ]);
  });

  it("should find empty updated items", () => {
    expect(
      findChangeTypes(
        [{ id: "a", last_modified: 123 }],
        [{ id: "a", last_modified: 456 }]
      )
    ).toStrictEqual([
      {
        id: "a",
        changeType: ChangeType.EMPTY_UPDATE,
        source: { id: "a", last_modified: 123 },
        target: { id: "a", last_modified: 456 },
      },
    ]);
  });

  it("should sort by id", () => {
    const sources = [
      { id: "a" },
      { id: "d", text: "foo" },
      { id: "c", text: "foo" },
      { id: "e", last_modified: 123 },
    ];
    const [, d, c, e] = sources;
    const targets = [
      { id: "c", text: "bar" },
      { id: "b" },
      { id: "a" },
      { id: "e", last_modified: 456 },
    ];
    const [c2, b, , e2] = targets;
    expect(findChangeTypes(sources, targets)).toStrictEqual([
      { id: "b", changeType: ChangeType.ADD, target: b },
      { id: "c", changeType: ChangeType.UPDATE, source: c, target: c2 },
      { id: "d", changeType: ChangeType.REMOVE, source: d },
      { id: "e", changeType: ChangeType.EMPTY_UPDATE, source: e, target: e2 },
    ]);
  });
});

describe("formatDiffHeader", () => {
  it("returns expected header based on provided records and displayFields", () => {
    const getTextContent = props => {
      return render(formatDiffHeader(props)).container.textContent;
    };

    expect(
      getTextContent({
        target: { id: "foo" },
      })
    ).toBe("id: foo");

    expect(
      getTextContent({
        source: { id: "foo" },
      })
    ).toBe("id: foo");

    expect(
      getTextContent({
        source: {
          id: "foo",
          prop1: "val1",
          prop2: "val2",
        },
        target: {
          id: "foo",
          prop1: "val3",
          prop2: "val4",
        },
      })
    ).toBe("id: foo");

    expect(
      getTextContent({
        source: {
          id: "foo",
          prop1: "val1",
          prop2: "val2",
          prop3: "prevVal",
        },
        target: {
          id: "foo",
          prop1: "val3",
          prop2: "val4",
          // prop3 intentionally undefined
        },
        displayFields: ["prop1", "prop2", "prop3"],
      })
    ).toBe("prop1: val3prop2: val4prop3: <unknown>id: foo");

    expect(
      getTextContent({
        target: {
          id: "foo",
          prop: {
            nestedProp: "nestedVal",
          },
        },
        displayFields: ["prop.nestedProp"],
      })
    ).toBe("prop.nestedProp: nestedValid: foo");
  });
});
