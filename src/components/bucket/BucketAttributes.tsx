import type {
  Capabilities,
  BucketState,
  BucketData,
  SessionState,
  BucketRouteMatch,
} from "../../types";

import React, { PureComponent } from "react";

import * as BucketActions from "../../actions/bucket";
import Spinner from "../Spinner";
import BucketForm from "./BucketForm";
import BucketTabs from "./BucketTabs";

export type OwnProps = {
  match: BucketRouteMatch;
};

export type StateProps = {
  session: SessionState;
  bucket: BucketState;
  capabilities: Capabilities;
};

export type Props = OwnProps &
  StateProps & {
    updateBucket: typeof BucketActions.updateBucket;
    deleteBucket: typeof BucketActions.deleteBucket;
  };

export default class BucketAttributes extends PureComponent<Props> {
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
    const { match, updateBucket } = this.props;
    const {
      params: { bid },
    } = match;
    updateBucket(bid, { data: formData });
  };

  render() {
    const { match, session, capabilities, bucket } = this.props;
    const {
      params: { bid },
    } = match;
    const { busy, data: formData } = bucket;
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>
          Edit <b>{bid}</b> bucket attributes
        </h1>
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
