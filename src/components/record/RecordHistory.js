/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  RecordState,
  RecordRouteParams,
  RouteLocation,
} from "../../types";

import React, { PureComponent } from "react";

import HistoryTable from "../HistoryTable";
import RecordTabs from "./RecordTabs";

export default class RecordHistory extends PureComponent {
  props: {
    params: RecordRouteParams,
    session: SessionState,
    capabilities: Capabilities,
    bucket: BucketState,
    record: RecordState,
    location: RouteLocation,
    listRecordNextHistory: () => void,
    notifyError: (message: string, error: ?Error) => void,
  };

  render() {
    const {
      params,
      record,
      capabilities,
      location,
      listRecordNextHistory,
      notifyError,
    } = this.props;
    const { bid, cid, rid } = params;
    const { history: { entries, loaded, hasNextPage } } = record;

    return (
      <div>
        <h1>History for <b>{bid}/{cid}/{rid}</b></h1>
        <RecordTabs
          bid={bid}
          cid={cid}
          rid={rid}
          selected="history"
          capabilities={capabilities}>
          <HistoryTable
            bid={bid}
            historyLoaded={loaded}
            history={entries}
            hasNextHistory={hasNextPage}
            listNextHistory={listRecordNextHistory}
            location={location}
            notifyError={notifyError}
          />
        </RecordTabs>
      </div>
    );
  }
}
