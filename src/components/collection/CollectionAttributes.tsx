import CollectionForm from "./CollectionForm";
import CollectionTabs from "./CollectionTabs";
import * as BucketActions from "@src/actions/bucket";
import Spinner from "@src/components/Spinner";
import { useBucket } from "@src/hooks/bucket";
import { useCollection } from "@src/hooks/collection";
import type {
  BucketState,
  Capabilities,
  CollectionData,
  CollectionRouteMatch,
  CollectionState,
  SessionState,
} from "@src/types";
import React from "react";
import { useParams } from "react-router";

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
  session,
  capabilities,
  updateCollection,
  deleteCollection,
}: Props) {
  const { bid, cid } = useParams();
  const collection = useCollection(bid, cid);

  const onSubmit = (formData: CollectionData) => {
    updateCollection(bid, cid, { data: formData });
  };

  const handleDeleteCollection = (cid: string) => {
    const message = [
      "This will delete the collection and all the records it contains.",
      "Are you sure?",
    ].join(" ");
    if (confirm(message)) {
      deleteCollection(bid, cid);
    }
  };

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
        {!collection ? (
          <Spinner />
        ) : (
          <CollectionForm
            session={session}
            deleteCollection={handleDeleteCollection}
            onSubmit={onSubmit}
          />
        )}
      </CollectionTabs>
    </div>
  );
}
