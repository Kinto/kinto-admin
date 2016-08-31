import React, { Component } from "react";

import RecordForm from "./RecordForm";


export default class AddForm extends Component {
  onSubmit = ({__attachment__: attachment, ...record}) => {
    const {params, createRecord} = this.props;
    const {bid, cid} = params;
    createRecord(bid, cid, record, attachment);
  }

  render() {
    const {params, session, collection} = this.props;
    const {bid, cid} = params;
    return (
      <div>
        <h1>Add a new record in <b>{bid}/{cid}</b></h1>
        <RecordForm
          bid={bid}
          cid={cid}
          session={session}
          collection={collection}
          onSubmit={this.onSubmit} />
      </div>
    );
  }
}
