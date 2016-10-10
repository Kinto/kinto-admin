import React, { Component } from "react";

import Spinner from "../Spinner";
import BucketTabs from "./BucketTabs";


export default class BucketPermissions extends Component {
  onSubmit = (formData) => {
    // const {params, updateBucket} = this.props;
    // const {bid} = params;
    // updateBucket(bid, formData);
  }

  render() {
    const {params, session, capabilities, bucket} = this.props;
    const {bid} = params;
    const {busy, permissions: formData} = bucket;
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Permissions for <b>{bid}</b> bucket</h1>
        <BucketTabs
          bid={bid}
          capabilities={capabilities}
          selected="permissions">
          <pre>{JSON.stringify(formData)}</pre>
        </BucketTabs>
      </div>
    );
  }
}
