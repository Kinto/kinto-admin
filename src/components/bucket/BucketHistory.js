/* @flow */
import type {
  Capabilities,
  BucketState,
  BucketRouteParams,
  RouteLocation,
} from "../../types";

import React, { PureComponent } from "react";

import BucketTabs from "./BucketTabs";
import HistoryTable from "../HistoryTable";

export default class BucketHistory extends PureComponent {
  props: {
    params: BucketRouteParams,
    bucket: BucketState,
    capabilities: Capabilities,
    location: RouteLocation,
    listBucketNextHistory: () => void,
    notifyError: (message: string, error: ?Error) => void,
  };

  render() {
    const {
      params,
      bucket,
      capabilities,
      location,
      listBucketNextHistory,
      notifyError,
    } = this.props;
    const { bid } = params;
    const {
      history: { entries, loaded, hasNextPage: hasNextHistoryPage },
    } = bucket;

    return (
      <div>
        <h1>History for <b>{bid}</b></h1>
        <BucketTabs bid={bid} selected="history" capabilities={capabilities}>
          <HistoryTable
            bid={bid}
            historyLoaded={loaded}
            history={entries}
            hasNextHistory={hasNextHistoryPage}
            listNextHistory={listBucketNextHistory}
            location={location}
            notifyError={notifyError}
          />
        </BucketTabs>
      </div>
    );
  }
}
