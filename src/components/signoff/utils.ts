import { SessionState, SignoffSourceInfo } from "@src/types";

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
  const { bid, cid } = source;
  const { signer = {} } = capabilities;
  // @ts-ignore
  const { [groupKey]: defaultGroupName } = signer;
  // @ts-ignore
  const { [groupKey]: groupName = defaultGroupName } = source;
  const expectedGroup = groupName.replace("{collection_id}", cid);
  const expectedPrincipal = `/buckets/${bid}/groups/${expectedGroup}`;

  return principals.includes(expectedPrincipal);
}
