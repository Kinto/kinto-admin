import { isMember, toReviewEnabled } from "@src/components/signoff/utils";

const source = {
  bucket: "sourceBucket",
  collection: "sourceCol",
};
const destination = {
  bucket: "destBucket",
  collection: "destCol",
};
const signerResource = {
  source: {
    bucket: source.bid,
    collection: source.cid,
  },
  destination: {
    bucket: destination.bid,
    collection: destination.cid,
  },
};

describe("toReviewEnabled", () => {
  it("returns false with all empty objs", () => {
    expect(toReviewEnabled({}, {}, {})).toBe(false);
  });

  it("returns true when server is true and no collection override", () => {
    expect(
      toReviewEnabled(
        {
          capabilities: {
            signer: {
              to_review_enabled: true,
            },
          },
        },
        {},
        {}
      )
    ).toBe(true);
  });

  it("returns true when server is true and collection override is true", () => {
    expect(
      toReviewEnabled(
        {
          capabilities: {
            signer: {
              to_review_enabled: true,
              resources: [
                {
                  ...signerResource,
                  to_review_enabled: true,
                },
              ],
            },
          },
        },
        source,
        destination
      )
    ).toBe(true);
  });

  it("returns false when server is false", () => {
    expect(
      toReviewEnabled(
        {
          capabilities: {
            signer: {
              to_review_enabled: false,
              resources: [
                {
                  ...signerResource,
                  to_review_enabled: true,
                },
              ],
            },
          },
        },
        source,
        destination
      )
    ).toBe(false);

    expect(
      toReviewEnabled(
        {
          capabilities: {
            signer: {
              to_review_enabled: false,
              resources: [signerResource],
            },
          },
        },
        source,
        destination
      )
    ).toBe(false);
  });

  it("returns false when server is true and collection override is false", () => {
    expect(
      toReviewEnabled(
        {
          capabilities: {
            signer: {
              to_review_enabled: true,
              resources: [
                {
                  ...signerResource,
                  to_review_enabled: false,
                },
              ],
            },
          },
        },
        source,
        destination
      )
    ).toBe(false);
  });
});

describe("isMember", () => {
  const testServerInfo = {
    user: {
      principals: ["/buckets/sourceBucket/groups/sourceCol-editors"],
    },
    capabilities: {
      signer: {
        editors_group: "{collection_id}-editors",
        reviewers_group: "{collection_id}-reviewers",
      },
    },
  };

  it("Returns true if user is a member of the group", () => {
    expect(isMember("editors_group", source, testServerInfo)).toBe(true);
  });

  it("Returns false if user is not a member of the group", () => {
    expect(isMember("reviewers_group", source, testServerInfo)).toBe(false);
  });
});
