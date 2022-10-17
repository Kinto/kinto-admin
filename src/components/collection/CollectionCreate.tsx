import type {
  SessionState,
  BucketState,
  CollectionState,
  BucketRouteMatch,
} from "../../types";

import React, { PureComponent } from "react";

import * as BucketActions from "../../actions/bucket";
import Spinner from "../Spinner";
import CollectionForm from "./CollectionForm";

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

export default class CollectionCreate extends PureComponent<Props> {
  render() {
    const { match, session, bucket, collection, createCollection } = this.props;
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
}
