/* @flow */
import type {
  Capabilities,
  SessionState,
  BucketState,
  HistoryFilters,
  RecordState,
  RecordRouteMatch,
  RouteLocation,
} from "../../types";

import React, { PureComponent } from "react";

import HistoryTable from "../HistoryTable";
import RecordTabs from "./RecordTabs";

type Props = {
  match: RecordRouteMatch,
  session: SessionState,
  capabilities: Capabilities,
  bucket: BucketState,
  record: RecordState,
  location: RouteLocation,
  listRecordHistory: (
    bid: string,
    cid: string,
    rid: string,
    filters: HistoryFilters
  ) => void,
  listRecordNextHistory: () => void,
  notifyError: (message: string, error: ?Error) => void,
  routing: Object,
};

export default class RecordHistory extends PureComponent<Props> {
  onRecordHistoryEnter() {
    const { listRecordHistory, match, routing, session } = this.props;
    const { bid, cid, rid } = match.params;
    const {
      locationBeforeTransitions: { query: filters },
    } = routing;
    if (!session.authenticated) {
      return;
    }
    listRecordHistory(bid, cid, rid, filters);
  }

  componentDidMount = this.onRecordHistoryEnter;
  componentDidUpdate = (prevProps: Props) => {
    if (prevProps.location !== this.props.location) {
      this.onRecordHistoryEnter();
    }
  };

  render() {
    const {
      match,
      record,
      capabilities,
      location,
      listRecordNextHistory,
      notifyError,
    } = this.props;
    const { bid, cid, rid } = match.params;
    const {
      history: { entries, loaded, hasNextPage },
    } = record;

    return (
      <div>
        <h1>
          History for{" "}
          <b>
            {bid}/{cid}/{rid}
          </b>
        </h1>
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
