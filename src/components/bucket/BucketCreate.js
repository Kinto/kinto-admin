import React, { Component } from "react";

import BucketForm from "./BucketForm";
import Spinner from "../Spinner";


export default class BucketCreate extends Component {
  render() {
    const {session, bucket, createBucket} = this.props;
    const {busy} = session;
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Create a new bucket</h1>
        <div className="panel panel-default">
          <div className="panel-body">
            <BucketForm
              session={session}
              bucket={bucket}
              onSubmit={({id, data}) => createBucket(id, data)} />
          </div>
        </div>
      </div>
    );
  }
}
