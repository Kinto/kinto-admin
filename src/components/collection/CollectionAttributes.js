/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  CollectionState,
  CollectionRouteMatch,
  CollectionData,
} from "../../types";

import React, { PureComponent } from "react";

import Spinner from "../Spinner";
import CollectionForm from "./CollectionForm";
import CollectionTabs from "./CollectionTabs";

type Props = {
  session: SessionState,
  bucket: BucketState,
  collection: CollectionState,
  capabilities: Capabilities,
  match: CollectionRouteMatch,
  updateCollection: (bid: string, cid: string, data: CollectionData) => void,
  deleteCollection: (bid: string, cid: string) => void,
};

export default class CollectionAttributes extends PureComponent<Props> {
  onSubmit = (formData: CollectionData) => {
    const { match, updateCollection } = this.props;
    const { bid, cid } = match.params;
    updateCollection(bid, cid, { data: formData });
  };

  deleteCollection = (cid: string) => {
    const { deleteCollection, match } = this.props;
    const { bid } = match.params;
    const message = [
      "This will delete the collection and all the records it contains.",
      "Are you sure?",
    ].join(" ");
    if (confirm(message)) {
      deleteCollection(bid, cid);
    }
  };

  render() {
    const { match, session, bucket, collection, capabilities } = this.props;
    const { bid, cid } = match.params;
    const { busy, data: formData } = collection;
    if (busy) {
      return <Spinner />;
    }
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
