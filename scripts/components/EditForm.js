import React, { Component } from "react";

import RecordForm from "./RecordForm";
import { cleanRecord } from "../utils";


export default class EditForm extends Component {
  onSubmit = (record) => {
    const {params, updateRecord} = this.props;
    const {bid, cid, rid} = params;
    updateRecord(bid, cid, rid, record);
  }

  render() {
    const {params, collection, record} = this.props;
    const {label} = collection;
    const {bid, cid, rid} = params;
    return (
      <div>
        <h1>Edit <b>{label}/{rid}</b></h1>
        <RecordForm
          bid={bid}
          cid={cid}
          collection={collection}
          record={cleanRecord(record)}
          onSubmit={this.onSubmit} />
      </div>
    );
  }
}
