import React, { Component } from "react";

import Spinner from "../Spinner";
import CollectionForm from "./CollectionForm";
import CollectionTabs from "./CollectionTabs";


export default class CollectionEdit extends Component {
  onSubmit = (formData) => {
    const {params, updateCollection} = this.props;
    const {bid, cid} = params;
    updateCollection(bid, cid, {data: formData});
  };

  deleteCollection = (cid) => {
    const {deleteCollection, params} = this.props;
    const {bid} = params;
    if (confirm("This will delete the collection and all the records it contains. Are you sure?")) {
      deleteCollection(bid, cid);
    }
  };

  render() {
    const {params, session, bucket, collection, capabilities} = this.props;
    const {bid, cid} = params;
    const {busy, data: formData} = collection;
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Edit <b>{bid}/{cid}</b> collection properties</h1>
        <CollectionTabs
          bid={bid}
          cid={cid}
          selected="settings"
          capabilities={capabilities}>
          <CollectionForm
            bid={bid}
            cid={cid}
            session={session}
            bucket={bucket}
            collection={collection}
            deleteCollection={this.deleteCollection}
            formData={formData}
            onSubmit={this.onSubmit} />
        </CollectionTabs>
      </div>
    );
  }
}
