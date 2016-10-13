import React, { Component } from "react";

import Spinner from "../Spinner";
import BucketForm from "./BucketForm";
import BucketTabs from "./BucketTabs";


export default class BucketAttributes extends Component {
  deleteBucket = (bid) => {
    const {deleteBucket} = this.props;
    if (confirm("This will delete the bucket and all the collections and " +
                "records it contains. Are you sure?")) {
      deleteBucket(bid);
    }
  };

  onSubmit = (formData) => {
    const {params, updateBucket} = this.props;
    const {bid} = params;
    updateBucket(bid, {data: formData});
  }

  render() {
    const {params, session, capabilities, bucket} = this.props;
    const {bid} = params;
    const {busy, data: formData} = bucket;
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Edit <b>{bid}</b> bucket attributes</h1>
        <BucketTabs
          bid={bid}
          capabilities={capabilities}
          selected="attributes">
          <BucketForm
            session={session}
            bid={bid}
            bucket={bucket}
            formData={formData}
            deleteBucket={this.deleteBucket}
            onSubmit={this.onSubmit} />
        </BucketTabs>
      </div>
    );
  }
}
