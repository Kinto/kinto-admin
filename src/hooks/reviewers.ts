import { useGroup } from "./group";
import { useServerInfo } from "./session";
import { useLatestApprovals } from "./signoff";
import type { Approval } from "./signoff";
import { groupName } from "@src/components/signoff/utils";
import type { SignoffSourceInfo } from "@src/types";
import uniqBy from "lodash/uniqBy";

export function useSuggestedReviewers(
  source: SignoffSourceInfo
): undefined | SuggestedReviewer[] {
  const { data: serverInfo } = useServerInfo();
  const group = useGroup(
    source.bucket,
    groupName("reviewers_group", source, serverInfo)
  );
  const approvals = useLatestApprovals(
    serverInfo,
    source.bucket,
    source.collection,
    source.lastModified
  );
  return group?.data && approvals
    ? suggestReviewers(
        group.data.members,
        approvals,
        source.lastReviewRequestBy
      )
    : undefined;
}

export interface SuggestedReviewer {
  id: string;
  lastApproval?: number;
}

export function suggestReviewers(
  members: string[],
  approvals: Approval[],
  excludeUserId?: string,
  limit = 5
): SuggestedReviewer[] {
  const candidates = members.filter(id => id !== excludeUserId);
  const approvers = approvals
    .filter(({ user_id }) => candidates.includes(user_id))
    .map(({ user_id, last_modified }) => ({
      id: user_id,
      lastApproval: last_modified,
    }));
  const suggested = uniqBy<SuggestedReviewer>(
    [...approvers, ...candidates.map(id => ({ id }))],
    "id"
  );
  return suggested.slice(0, limit);
}
