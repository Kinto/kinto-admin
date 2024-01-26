import * as BucketActions from "../../actions/bucket";
import type {
  BucketRouteMatch,
  BucketState,
  CollectionState,
  SessionState,
} from "../../types";
import Spinner from "../Spinner";
import CollectionForm from "./CollectionForm";
import React from "react";

export type OwnProps = {
  match: BucketRouteMatch;
};

export type StateProps = {
  session: SessionState;
  bucket: BucketState;
  collection: CollectionState;
};

export type Props = OwnProps &
  StateProps & {
    createCollection: typeof BucketActions.createCollection;
  };

export default function CollectionCreate({
  match,
  session,
  bucket,
  collection,
  createCollection,
}: Props) {
  const {
    params: { bid },
  } = match;
  const { busy } = session;

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
            onSubmit={formData => createCollection(bid, formData)}
          />
        </div>
      </div>
    </div>
  );
}
