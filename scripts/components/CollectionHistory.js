import React, { Component } from "react";
// import { Link } from "react-router";

import Spinner from "./Spinner";


function HistoryTable(props) {
  const {history} = props;
  return (
    <table className="table table-striped table-bordered history-list">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Id</th>
          <th>Author</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>2016-07-20T11:18:36.530281</td>
          <td>update</td>
          <td>cb98ecd7-a66f-4f9d-82c5-73d06930f4f2</td>
          <td>basicauth:43181ac0ae7581a23288c25a98786ef9db86433c62a04fd6071d11653ee69089</td>
          <td>xxx</td>
        </tr>
      </tbody>
    </table>
  );
}

export default class CollectionHistory extends Component {
  render() {
    const {params, collection} = this.props;
    const {bid, cid} = params;
    const {busy, history} = collection;

    return (
      <div className="collection-history">
        <h1>History for <b>{bid}/{cid}</b></h1>
        { busy ? <Spinner /> :
          <HistoryTable history={history} />}
      </div>
    );
  }
}
