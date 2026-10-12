import {
  groupName,
  isMember,
  suggestReviewers,
  toReviewEnabled,
} from "@src/components/signoff/utils";

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
    bucket: source.bucket,
    collection: source.collection,
  },
  destination: {
    bucket: destination.bucket,
    collection: destination.collection,
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

describe("groupName", () => {
  const testServerInfo = {
    capabilities: {
      signer: {
        editors_group: "{collection_id}-editors",
        reviewers_group: "{collection_id}-reviewers",
      },
    },
  };

  it("Uses the default group name with the collection id", () => {
    expect(groupName("reviewers_group", source, testServerInfo)).toBe(
      "sourceCol-reviewers"
    );
  });

  it("Uses the group name override of the source", () => {
    expect(
      groupName(
        "reviewers_group",
        { ...source, reviewers_group: "custom-{collection_id}" },
        testServerInfo
      )
    ).toBe("custom-sourceCol");
  });

  it("Returns undefined if signer is not enabled", () => {
    expect(
      groupName("reviewers_group", source, { capabilities: {} })
    ).toBeUndefined();
  });
});

describe("suggestReviewers", () => {
  const members = ["a", "b", "c", "d", "e", "f", "g"];

  it("Lists recent approvers first, without duplicates", () => {
    const approvals = [
      { user_id: "c", last_modified: 30 },
      { user_id: "b", last_modified: 20 },
      { user_id: "c", last_modified: 10 },
    ];
    expect(suggestReviewers(["a", "b", "c"], approvals)).toEqual([
      { id: "c", lastApproval: 30 },
      { id: "b", lastApproval: 20 },
      { id: "a" },
    ]);
  });

  it("Ignores approvals from users who are not members", () => {
    const approvals = [{ user_id: "z", last_modified: 30 }];
    expect(suggestReviewers(["a"], approvals)).toEqual([{ id: "a" }]);
  });

  it("Excludes the given user", () => {
    const approvals = [{ user_id: "a", last_modified: 30 }];
    expect(suggestReviewers(["a", "b"], approvals, "a")).toEqual([{ id: "b" }]);
  });

  it("Limits to 5 reviewers, keeping the most recent approvers", () => {
    const approvals = [
      { user_id: "g", last_modified: 20 },
      { user_id: "f", last_modified: 10 },
    ];
    expect(suggestReviewers(members, approvals).map(r => r.id)).toEqual([
      "g",
      "f",
      "a",
      "b",
      "c",
    ]);
  });
});
