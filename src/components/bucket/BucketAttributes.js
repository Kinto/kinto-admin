/* @flow */
import type {
  Capabilities,
  BucketState,
  BucketData,
  SessionState,
  BucketRouteParams,
} from "../../types";

import React, { PureComponent } from "react";

import Spinner from "../Spinner";
import BucketForm from "./BucketForm";
import BucketTabs from "./BucketTabs";

export default class BucketAttributes extends PureComponent {
  props: {
    params: BucketRouteParams,
    session: SessionState,
    bucket: BucketState,
    capabilities: Capabilities,
    updateBucket: (bid: string, data: BucketData) => void,
    deleteBucket: (bid: string) => void,
  };

  deleteBucket = (bid: string) => {
    const { deleteBucket } = this.props;
    const message = [
      "This will delete the bucket and all the collections and",
      "records it contains. Are you sure?",
    ].join(" ");
    if (confirm(message)) {
      deleteBucket(bid);
    }
  };

  onSubmit = (formData: BucketData) => {
    const { params, updateBucket } = this.props;
    const { bid } = params;
    updateBucket(bid, { data: formData });
  };

  render() {
    const { params, session, capabilities, bucket } = this.props;
    const { bid } = params;
    const { busy, data: formData } = bucket;
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Edit <b>{bid}</b> bucket attributes</h1>
        <BucketTabs bid={bid} capabilities={capabilities} selected="attributes">
          <BucketForm
            session={session}
            bid={bid}
            bucket={bucket}
            formData={formData}
            deleteBucket={this.deleteBucket}
            onSubmit={this.onSubmit}
          />
        </BucketTabs>
      </div>
    );
  }
}
