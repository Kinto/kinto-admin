import React, { Component } from "react";

import CollectionForm from "./CollectionForm";
import Spinner from "./Spinner";


export default class CollectionCreate extends Component {
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
