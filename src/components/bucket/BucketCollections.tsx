import BucketTabs from "./BucketTabs";
import { DataList, ListActions } from "./CollectionDataList";
import * as BucketActions from "@src/actions/bucket";
import { useCollectionList } from "@src/hooks/collection";
import type { Capabilities, SessionState } from "@src/types";
import React, { useEffect } from "react";
import { useParams } from "react-router";

export type StateProps = {
  session: SessionState;
  capabilities: Capabilities;
};

export type Props = OwnProps &
  StateProps & {
    listBucketCollections: typeof BucketActions.listBucketCollections;
    listBucketNextCollections: typeof BucketActions.listBucketNextCollections;
  };

export default function BucketCollections({
  session,
  capabilities,
  listBucketCollections,
  listBucketNextCollections,
}) {
  const { bid } = useParams();
  const collections = useCollectionList(bid);

  const listActions = (
    <ListActions bid={bid} session={session} busy={!collections} />
  );

  return (
    <div className="list-page">
      <h1>
        Collections of <b>{bid}</b>
      </h1>
      <BucketTabs bid={bid} selected="collections" capabilities={capabilities}>
        {listActions}
        {collections && collections.length === 0 ? (
          <div className="alert alert-info">
            <p>This bucket has no collections.</p>
          </div>
        ) : (
          <DataList
            bid={bid}
            collections={collections}
            listBucketNextCollections={listBucketNextCollections}
            capabilities={capabilities}
            showSpinner={!collections}
          />
        )}
        {listActions}
      </BucketTabs>
    </div>
  );
}
