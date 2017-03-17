/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  CollectionState,
  CollectionRouteParams,
  CollectionData,
} from "../../types";

import React, { PureComponent } from "react";

import Spinner from "../Spinner";
import CollectionForm from "./CollectionForm";
import CollectionTabs from "./CollectionTabs";

export default class CollectionAttributes extends PureComponent {
  props: {
    session: SessionState,
    bucket: BucketState,
    collection: CollectionState,
    capabilities: Capabilities,
    params: CollectionRouteParams,
    updateCollection: (bid: string, cid: string, data: CollectionData) => void,
    deleteCollection: (bid: string, cid: string) => void,
  };

  onSubmit = (formData: CollectionData) => {
    const { params, updateCollection } = this.props;
    const { bid, cid } = params;
    updateCollection(bid, cid, { data: formData });
  };

  deleteCollection = (cid: string) => {
    const { deleteCollection, params } = this.props;
    const { bid } = params;
    const message = [
      "This will delete the collection and all the records it contains.",
      "Are you sure?",
    ].join(" ");
    if (confirm(message)) {
      deleteCollection(bid, cid);
    }
  };

  render() {
    const { params, session, bucket, collection, capabilities } = this.props;
    const { bid, cid } = params;
    const { busy, data: formData } = collection;
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Edit <b>{bid}/{cid}</b> collection attributes</h1>
        <CollectionTabs
          bid={bid}
          cid={cid}
          selected="attributes"
          capabilities={capabilities}>
          <CollectionForm
            bid={bid}
            cid={cid}
            session={session}
            bucket={bucket}
            collection={collection}
            deleteCollection={this.deleteCollection}
            formData={formData}
            onSubmit={this.onSubmit}
          />
        </CollectionTabs>
      </div>
    );
  }
}
