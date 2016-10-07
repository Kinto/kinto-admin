import React, { Component } from "react";

import Spinner from "../Spinner";
import HistoryTable from "../HistoryTable";
import CollectionTabs from "./CollectionTabs";


export default class CollectionHistory extends Component {
  render() {
    const {params, collection, capabilities, location: {query: since}} = this.props;
    const {bid, cid} = params;
    const {history, historyLoaded} = collection;

    return (
      <div>
        <h1>History for <b>{bid}/{cid}</b></h1>
        <CollectionTabs
          bid={bid}
          cid={cid}
          selected="history"
          capabilities={capabilities}>
          { !historyLoaded ? <Spinner /> :
            <HistoryTable bid={bid} history={history} since={since} />}
        </CollectionTabs>
      </div>
    );
  }
}
