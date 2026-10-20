import { suggestReviewers } from "@src/hooks/reviewers";

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
