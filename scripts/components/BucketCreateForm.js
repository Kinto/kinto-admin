import React, { Component } from "react";

import BucketForm from "./BucketForm";
import Spinner from "./Spinner";


export default class BucketCreateForm extends Component {
  render() {
    const {session, bucket, createBucket} = this.props;
    const {busy} = session;
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Create a new bucket</h1>
        <BucketForm
          bucket={bucket}
          onSubmit={({name, data}) => createBucket(name, data)} />
      </div>
    );
  }
}
