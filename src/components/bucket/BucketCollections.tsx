import * as BucketActions from "../../actions/bucket";
import type {
  BucketRouteMatch,
  BucketState,
  Capabilities,
  SessionState,
} from "../../types";
import BucketTabs from "./BucketTabs";
import { DataList, ListActions } from "./CollectionDataList";
import type { Location } from "history";
import React, { useEffect } from "react";

export type OwnProps = {
  match: BucketRouteMatch;
  location: Location;
};

export type StateProps = {
  session: SessionState;
  bucket: BucketState;
  capabilities: Capabilities;
};

export type Props = OwnProps &
  StateProps & {
    listBucketCollections: typeof BucketActions.listBucketCollections;
    listBucketNextCollections: typeof BucketActions.listBucketNextCollections;
  };

export default function BucketCollections({
  match,
  location,
  session,
  bucket,
  capabilities,
  listBucketCollections,
  listBucketNextCollections,
}) {
  useEffect(() => {
    const onBucketPageEnter = () => {
      const { params } = match;
      if (!session.authenticated) {
        // We're not authenticated, skip requesting the list of records. This likely
        // occurs when users refresh the page and lose their session.
        return;
      }
      listBucketCollections(params.bid);
    };

    onBucketPageEnter();
  }, [match, location, session, listBucketCollections]);

  const {
    params: { bid },
  } = match;
  const { collections } = bucket;

  const listActions = (
    <ListActions bid={bid} session={session} bucket={bucket} />
  );

  return (
    <div className="list-page">
      <h1>
        Collections of <b>{bid}</b>
      </h1>
      <BucketTabs bid={bid} selected="collections" capabilities={capabilities}>
        {listActions}
        {collections.loaded && collections.entries.length === 0 ? (
          <div className="alert alert-info">
            <p>This bucket has no collections.</p>
          </div>
        ) : (
          <DataList
            bid={bid}
            collections={collections}
            listBucketNextCollections={listBucketNextCollections}
            capabilities={capabilities}
          />
        )}
        {listActions}
      </BucketTabs>
    </div>
  );
}
