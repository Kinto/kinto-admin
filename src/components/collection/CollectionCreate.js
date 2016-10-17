/* @flow */
import type {
  SessionState,
  BucketState,
  CollectionState,
  RouteParams,
} from "../../types";

import React, { Component } from "react";

import Spinner from "../Spinner";
import CollectionForm from "./CollectionForm";


export default class CollectionCreate extends Component {
  props: {
    session: SessionState,
    bucket: BucketState,
    collection: CollectionState,
    capabilities: Object,
    params: RouteParams,
    createCollection: Function,
  };

  render() {
    const {params, session, bucket, collection, createCollection} = this.props;
    const {bid} = params;
    const {busy} = session;
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
              onSubmit={(formData) => createCollection(bid, formData)} />
          </div>
        </div>
      </div>
    );
  }
}
