import type { Approval } from "@src/hooks/signoff";
import type {
  ServerInfo,
  SignerCapabilityResource,
  SignerCapabilityResourceEntry,
  SignoffSourceInfo,
} from "@src/types";
import uniqBy from "lodash/uniqBy";

type GroupKey = "editors_group" | "reviewers_group";

export function groupName(
  groupKey: GroupKey,
  source: SignoffSourceInfo,
  serverInfo: ServerInfo
): string | undefined {
  if (!source) {
    return;
  }
  const name = source[groupKey] ?? serverInfo?.capabilities?.signer?.[groupKey];
  return name?.replace("{collection_id}", source.collection);
}

export function isMember(
  groupKey: GroupKey,
  source: SignoffSourceInfo,
  serverInfo: ServerInfo
) {
  const { user } = serverInfo;
  const expectedGroup = groupName(groupKey, source, serverInfo);
  if (!expectedGroup || !user?.principals) {
    return false;
  }
  const expectedPrincipal = `/buckets/${source.bucket}/groups/${expectedGroup}`;

  return user.principals.includes(expectedPrincipal);
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

export function toReviewEnabled(
  serverInfo: ServerInfo,
  source: SignerCapabilityResourceEntry,
  destination: SignerCapabilityResourceEntry
) {
  let enabled = serverInfo?.capabilities?.signer?.to_review_enabled === true;

  if (enabled) {
    const resourceMatch: SignerCapabilityResource =
      serverInfo?.capabilities?.signer?.resources?.find(
        x =>
          x.source.bucket === source.bucket &&
          x.source.collection === source.collection &&
          x.destination.bucket === destination.bucket &&
          x.destination.collection === destination.collection
      );
    if (resourceMatch && "to_review_enabled" in resourceMatch) {
      enabled = resourceMatch.to_review_enabled;
    }
  }

  return enabled;
}
