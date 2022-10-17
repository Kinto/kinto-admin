import { expect } from "chai";

import url from "../src/url";

describe("url", () => {
  it("should generate a url", () => {
    expect(
      url("record:permissions", {
        bid: "bucket",
        cid: "collection",
        rid: "record",
      })
    ).eql("/buckets/bucket/collections/collection/records/record/permissions");
  });

  it("should raise an error if the route name does not exist", () => {
    expect(() => url("nope")).to.Throw(Error, /Unknown URL/);
  });
});
