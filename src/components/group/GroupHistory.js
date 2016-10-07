import React, { Component } from "react";

import Spinner from "../Spinner";
import HistoryTable from "../HistoryTable";
import CollectionTabs from "./GroupTabs";


export default class GroupHistory extends Component {
  render() {
    const {params, group, capabilities} = this.props;
    const {bid, gid} = params;
    const {history, historyLoaded} = group;

    return (
      <div>
        <h1>History for <b>{bid}/{gid}</b></h1>
        <CollectionTabs
          bid={bid}
          gid={gid}
          selected="history"
          capabilities={capabilities}>
          { !historyLoaded ? <Spinner /> :
            <HistoryTable bid={bid} history={history} />}
        </CollectionTabs>
      </div>
    );
  }
}
