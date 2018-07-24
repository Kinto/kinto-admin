/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  CollectionState,
  CollectionData,
  BucketRouteMatch,
} from "../../types";

import React, { PureComponent } from "react";

import Spinner from "../Spinner";
import CollectionForm from "./CollectionForm";

type Props = {
  session: SessionState,
  bucket: BucketState,
  collection: CollectionState,
  capabilities: Capabilities,
  match: BucketRouteMatch,
  createCollection: (bid: string, data: CollectionData) => void,
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
        <div className="panel panel-default">
          <div className="panel-body">
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
