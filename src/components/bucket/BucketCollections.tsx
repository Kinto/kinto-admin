import BucketTabs from "./BucketTabs";
import { DataList, ListActions } from "./CollectionDataList";
import { useAppSelector } from "@src/hooks/app";
import { useCollectionList } from "@src/hooks/collection";
import React from "react";
import { useParams } from "react-router";

export default function BucketCollections() {
  const { bid } = useParams();
  const collections = useCollectionList(bid);
  const session = useAppSelector(state => state.session);

  const listActions = (
    <ListActions bid={bid} session={session} busy={!collections} />
  );

  return (
    <div className="list-page">
      <h1>
        Collections of <b>{bid}</b>
      </h1>
      <BucketTabs bid={bid} selected="collections">
        {listActions}
        {collections && collections.length === 0 ? (
          <div className="alert alert-info">
            <p>This bucket has no collections.</p>
          </div>
        ) : (
          <DataList
            bid={bid}
            collections={collections}
            listBucketNextCollections={collections?.next}
            capabilities={session.serverInfo.capabilities}
            showSpinner={!collections}
          />
        )}
        {listActions}
      </BucketTabs>
    </div>
  );
}
