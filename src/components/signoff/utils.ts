import { DestinationInfo, SessionState, SignoffSourceInfo } from "@src/types";

export function isMember(
  groupKey: string,
  source: SignoffSourceInfo,
  sessionState: SessionState
) {
  const {
    serverInfo: { user, capabilities },
  } = sessionState;
  if (!source || !user?.principals) {
    return false;
  }
  const { principals } = user;
  const { bucket, collection } = source;
  const { signer = {} } = capabilities;
  // @ts-ignore
  const { [groupKey]: defaultGroupName } = signer;
  // @ts-ignore
  const { [groupKey]: groupName = defaultGroupName } = source;
  const expectedGroup = groupName.replace("{collection_id}", collection);
  const expectedPrincipal = `/buckets/${bucket}/groups/${expectedGroup}`;

  return principals.includes(expectedPrincipal);
}

export function toReviewEnabled(
  sessionState: SessionState,
  source: SignoffSourceInfo,
  destination: DestinationInfo
) {
  let enabled =
    sessionState.serverInfo?.capabilities?.signer?.to_review_enabled === true;

  if (enabled) {
    const resourceMatch =
      sessionState.serverInfo?.capabilities?.signer?.resources?.find(
        x =>
          x.source.bucket === source.bid &&
          x.source.collection === source.cid &&
          x.destination.bucket === destination.bid &&
          x.destination.collection === destination.cid
      );
    if (resourceMatch && "to_review_enabled" in resourceMatch) {
      enabled = resourceMatch.to_review_enabled;
    }
  }

  return enabled;
}
