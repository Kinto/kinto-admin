/* @flow */
import type { SessionState, BucketState, BucketData } from "../../types";

import React, { PureComponent } from "react";

import BucketForm from "./BucketForm";
import Spinner from "../Spinner";

export default class BucketCreate extends PureComponent {
  props: {
    session: SessionState,
    bucket: BucketState,
    createBucket: (bid: string, data: BucketData) => void,
  };

  render() {
    const { session, bucket, createBucket } = this.props;
    const { busy } = session;
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
              onSubmit={({ id, ...attributes }) => createBucket(id, attributes)}
            />
          </div>
        </div>
      </div>
    );
  }
}
