import React, { Component } from "react";

import RecordForm from "./RecordForm";
import { omit } from "../utils";


function recordToFormData(record) {
  return omit(record, ["id", "last_modified", "schema"]);
}

export default class EditForm extends Component {
  onSubmit = (record) => {
    const {params, updateRecord} = this.props;
    const {bid, cid, rid} = params;
    updateRecord(bid, cid, rid, record);
  }

  render() {
    const {params, collection, record} = this.props;
    const {bid, cid} = params;
    return (
      <div>
        <h1>Add a new record in {bid}/{cid}</h1>
        <RecordForm
          bid={bid}
          cid={cid}
          collection={collection}
          record={recordToFormData(record)}
          onSubmit={this.onSubmit} />
      </div>
    );
  }
}
