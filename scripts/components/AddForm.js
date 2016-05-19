import React, { Component } from "react";

import RecordForm from "./RecordForm";


export default class AddForm extends Component {
  onSubmit = (record) => {
    const {params, createRecord} = this.props;
    const {bid, cid} = params;
    createRecord(bid, cid, record);
  }

  render() {
    const {params, collection} = this.props;
    const {label} = collection;
    const {bid, cid} = params;
    return (
      <div>
        <h1>Add a new record in <b>{label}</b></h1>
        <RecordForm
          bid={bid}
          cid={cid}
          collection={collection}
          onSubmit={this.onSubmit} />
      </div>
    );
  }
}
