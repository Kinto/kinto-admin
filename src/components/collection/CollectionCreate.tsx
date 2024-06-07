import CollectionForm from "./CollectionForm";
import { createCollection } from "@src/actions/bucket";
import Spinner from "@src/components/Spinner";
import { useAppDispatch, useAppSelector } from "@src/hooks/app";
import type { RouteParams } from "@src/types";
import React from "react";
import { useParams } from "react-router";

export function CollectionCreate() {
  const dispatch = useAppDispatch();
  const { session, bucket, collection } = useAppSelector(state => state);
  const busy = session.busy;
  const { bid } = useParams<RouteParams>();

  if (busy) {
    return <Spinner />;
  }

  return (
    <div>
      <h1>
        Create a new collection in <b>{bid}</b> bucket
      </h1>
      <div className="card">
        <div className="card-body">
          <CollectionForm
            session={session}
            bucket={bucket}
            collection={collection}
            onSubmit={formData => dispatch(createCollection(bid, formData))}
          />
        </div>
      </div>
    </div>
  );
}
