import React, { Component } from "react";

import Spinner from "../Spinner";
import BucketForm from "./BucketForm";
import BucketTabs from "./BucketTabs";


export default class BucketEdit extends Component {
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
    updateBucket(bid, formData);
  }

  render() {
    const {params, session, capabilities, bucket} = this.props;
    const {bid} = params;
    const {busy} = session;
    if (busy) {
      return <Spinner />;
    }
    const formData = {
      id: bid,
      // Stringify JSON fields so they're editable in a text field
      data: JSON.stringify(bucket && bucket.data || {}, null, 2),
    };
    return (
      <div>
        <h1>Manage <b>{bid}</b> bucket</h1>
        <BucketTabs
          bid={bid}
          capabilities={capabilities}
          selected="settings">
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
