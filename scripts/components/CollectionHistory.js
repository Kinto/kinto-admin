import React, { Component } from "react";

import Spinner from "./Spinner";
import CollectionTabs from "./CollectionTabs";
import HistoryTable from "./HistoryTable";


export default class CollectionHistory extends Component {
  render() {
    const {params, collection, capabilities} = this.props;
    const {bid, cid} = params;
    const {history, listLoaded} = collection;

    return (
      <div>
        <h1>History for <b>{bid}/{cid}</b></h1>
        <CollectionTabs
          bid={bid}
          cid={cid}
          selected="history"
          capabilities={capabilities}>
          { !listLoaded ? <Spinner /> :
            <HistoryTable history={history} />}
        </CollectionTabs>
      </div>
    );
  }
}
