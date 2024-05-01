import BucketTabs from "./BucketTabs";
import { DataList, ListActions } from "./GroupDataList";
import type {
  BucketRouteMatch,
  BucketState,
  Capabilities,
  SessionState,
} from "@src/types";
import React from "react";

type OwnProps = {
  match: BucketRouteMatch;
};

type StateProps = {
  session: SessionState;
  bucket: BucketState;
  capabilities: Capabilities;
};

type Props = OwnProps & StateProps;

export default function BucketCollections({
  match,
  session,
  bucket,
  capabilities,
}: Props) {
  const {
    params: { bid },
  } = match;
  const { groups } = bucket;

  const listActions = (
    <ListActions bid={bid} session={session} bucket={bucket} />
  );

  return (
    <div className="list-page">
      <h1>
        Groups of <b>{bid}</b>
      </h1>
      <BucketTabs bid={bid} selected="groups" capabilities={capabilities}>
        {listActions}
        {!bucket.busy && groups.length === 0 ? (
          <div className="alert alert-info">
            <p>This bucket has no groups.</p>
          </div>
        ) : (
          <DataList
            bid={bid}
            groups={groups}
            capabilities={capabilities}
            showSpinner={bucket.busy}
          />
        )}
        {listActions}
      </BucketTabs>
    </div>
  );
}
