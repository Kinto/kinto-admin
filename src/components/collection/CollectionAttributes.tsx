import CollectionForm from "./CollectionForm";
import CollectionTabs from "./CollectionTabs";
import { deleteCollection, updateCollection } from "@src/actions/bucket";
import Spinner from "@src/components/Spinner";
import { useAppDispatch, useAppSelector } from "@src/hooks/app";
import type { CollectionData, RouteParams } from "@src/types";
import React from "react";
import { useParams } from "react-router";

export function CollectionAttributes() {
  const dispatch = useAppDispatch();
  const { bucket, session, collection } = useAppSelector(state => state);
  const capabilities = session.serverInfo.capabilities;
  const { bid, cid } = useParams<RouteParams>();

  const onSubmit = (formData: CollectionData) => {
    dispatch(updateCollection(bid, cid, { data: formData }));
  };

  const handleDeleteCollection = (cid: string) => {
    const message = [
      "This will delete the collection and all the records it contains.",
      "Are you sure?",
    ].join(" ");
    if (confirm(message)) {
      dispatch(deleteCollection(bid, cid));
    }
  };

  const { busy, data: formData } = collection;

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
        {busy ? (
          <Spinner />
        ) : (
          <CollectionForm
            cid={cid}
            session={session}
            bucket={bucket}
            collection={collection}
            deleteCollection={handleDeleteCollection}
            formData={formData}
            onSubmit={onSubmit}
          />
        )}
      </CollectionTabs>
    </div>
  );
}
