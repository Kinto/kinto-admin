import { fetchAttachmentTexts } from "@src/components/signoff/SimpleReview/AttachmentDiff";

function stubFetch(files: Record<string, string>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      url in files
        ? new Response(files[url])
        : new Response("Not found", { status: 404 })
    )
  );
}

describe("fetchAttachmentTexts", () => {
  it("fetches both versions as text", async () => {
    stubFetch({ "/old": "a\nb\n", "/new": "a\nc\n" });
    expect(await fetchAttachmentTexts("/old", "/new")).toStrictEqual({
      oldText: "a\nb\n",
      newText: "a\nc\n",
    });
  });

  it("pretty-prints when both versions are JSON", async () => {
    stubFetch({ "/old": '{"a":1}', "/new": '{"a":2}' });
    expect(await fetchAttachmentTexts("/old", "/new")).toStrictEqual({
      oldText: '{\n  "a": 1\n}',
      newText: '{\n  "a": 2\n}',
    });
  });

  it("leaves both versions as-is when only one is JSON", async () => {
    stubFetch({ "/old": '{"a":1}', "/new": "not json" });
    expect(await fetchAttachmentTexts("/old", "/new")).toStrictEqual({
      oldText: '{"a":1}',
      newText: "not json",
    });
  });

  it("throws when a version can't be fetched", async () => {
    stubFetch({ "/old": "a" });
    await expect(fetchAttachmentTexts("/old", "/new")).rejects.toThrow(
      "HTTP 404 for /new"
    );
  });
});
