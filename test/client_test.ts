import { retryingFetch, setupClient } from "@src/client";
import { KintoClient } from "kinto";

function response(status: number, headers: Record<string, string> = {}): any {
  return { status, headers: new Headers(headers) };
}

describe("setupClient", () => {
  it("wires the retrying fetch into the client", () => {
    vi.mocked(KintoClient).mockClear();

    setupClient({ authType: "anonymous", server: "http://server.test/v1" });

    expect(vi.mocked(KintoClient).mock.calls[0][1]).toMatchObject({
      fetchFunc: retryingFetch,
      retry: 1,
    });
  });
});

describe("retryingFetch", () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retries a transient server error and returns the successful response", async () => {
    fetchMock
      .mockResolvedValueOnce(response(502))
      .mockResolvedValueOnce(response(200));

    const result = await retryingFetch("/v1/buckets/main");

    expect(result.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries a network error and returns the successful response", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(response(200));

    const result = await retryingFetch("/v1/buckets/main");

    expect(result.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("gives up and returns the last response once retries are exhausted", async () => {
    fetchMock.mockResolvedValue(response(503));

    const result = await retryingFetch("/v1/buckets/main");

    expect(result.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("gives up and rethrows the network error once retries are exhausted", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(retryingFetch("/v1/buckets/main")).rejects.toThrow(
      "Failed to fetch"
    );
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("does not retry requests that are not idempotent", async () => {
    fetchMock.mockResolvedValue(response(503));

    const result = await retryingFetch("/v1/buckets/main", { method: "POST" });

    expect(result.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not retry client errors", async () => {
    fetchMock.mockResolvedValue(response(403));

    const result = await retryingFetch("/v1/buckets/main");

    expect(result.status).toBe(403);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("leaves responses that specify a delay to the client's own retry", async () => {
    fetchMock.mockResolvedValue(response(503, { "Retry-After": "10" }));

    const result = await retryingFetch("/v1/buckets/main");

    expect(result.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
