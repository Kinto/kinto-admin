import url from "@src/url";

describe("url", () => {
  it("should generate a url", () => {
    expect(
      url("record:permissions", {
        bid: "bucket",
        cid: "collection",
        rid: "record",
      })
    ).toBe("/buckets/bucket/collections/collection/records/record/permissions");
  });

  it("should raise an error if the route name does not exist", () => {
    expect(() => url("nope")).toThrow(Error, /Unknown URL/);
  });
});
