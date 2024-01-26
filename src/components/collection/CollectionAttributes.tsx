import CollectionForm from "./CollectionForm";
import CollectionTabs from "./CollectionTabs";
import * as BucketActions from "@src/actions/bucket";
import Spinner from "@src/components/Spinner";
import type {
  BucketState,
  Capabilities,
  CollectionData,
  CollectionRouteMatch,
  CollectionState,
  SessionState,
} from "@src/types";
import React from "react";

export type OwnProps = {
  match: CollectionRouteMatch;
};

export type StateProps = {
  session: SessionState;
  bucket: BucketState;
  collection: CollectionState;
  capabilities: Capabilities;
};

export type Props = OwnProps &
  StateProps & {
    updateCollection: typeof BucketActions.updateCollection;
    deleteCollection: typeof BucketActions.deleteCollection;
  };

export default function CollectionAttributes({
  match,
  session,
  bucket,
  collection,
  capabilities,
  updateCollection,
  deleteCollection,
}: Props) {
  const onSubmit = (formData: CollectionData) => {
    const {
      params: { bid, cid },
    } = match;
    updateCollection(bid, cid, { data: formData });
  };

  const handleDeleteCollection = (cid: string) => {
    const {
      params: { bid },
    } = match;
    const message = [
      "This will delete the collection and all the records it contains.",
      "Are you sure?",
    ].join(" ");
    if (confirm(message)) {
      deleteCollection(bid, cid);
    }
  };

  const {
    params: { bid, cid },
  } = match;
  const { busy, data: formData } = collection;

  if (busy) {
    return <Spinner />;
  }

  return (
    <div>
      <h1>
        Edit{" "}
        <b>
          {bid}/{cid}
        </b>{" "}
        collection attributes
      </h1>
      <CollectionTabs
        bid={bid}
        cid={cid}
        selected="attributes"
        capabilities={capabilities}
      >
        <CollectionForm
          bid={bid}
          cid={cid}
          session={session}
          bucket={bucket}
          collection={collection}
          deleteCollection={handleDeleteCollection}
          formData={formData}
          onSubmit={onSubmit}
        />
      </CollectionTabs>
    </div>
  );
}
