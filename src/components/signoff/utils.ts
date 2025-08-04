import {
  ServerInfo,
  SignerCapabilityResource,
  SignerCapabilityResourceEntry,
  SignoffSourceInfo,
} from "@src/types";

type GroupKey = "editors_group" | "reviewers_group";

export function isMember(
  groupKey: GroupKey,
  source: SignoffSourceInfo,
  serverInfo: ServerInfo
) {
  const { user, capabilities } = serverInfo;
  if (!source || !user?.principals) {
    return false;
  }
  if (!("signer" in capabilities)) {
    return false;
  }
  const { principals } = user;
  const { bucket, collection } = source;
  const { [groupKey]: defaultGroupName } = capabilities.signer;
  const { [groupKey]: groupName = defaultGroupName } = source;
  const expectedGroup = groupName.replace("{collection_id}", collection);
  const expectedPrincipal = `/buckets/${bucket}/groups/${expectedGroup}`;

  return principals.includes(expectedPrincipal);
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
