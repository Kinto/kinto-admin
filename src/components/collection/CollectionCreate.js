/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  CollectionState,
  CollectionData,
  BucketRouteParams,
} from "../../types";

import React, { PureComponent } from "react";

import Spinner from "../Spinner";
import CollectionForm from "./CollectionForm";

export default class CollectionCreate extends PureComponent {
  props: {
    session: SessionState,
    bucket: BucketState,
    collection: CollectionState,
    capabilities: Capabilities,
    params: BucketRouteParams,
    createCollection: (bid: string, data: CollectionData) => void,
  };

  render() {
    const {
      params,
      session,
      bucket,
      collection,
      createCollection,
    } = this.props;
    const { bid } = params;
    const { busy } = session;
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Create a new collection in <b>{bid}</b> bucket</h1>
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
