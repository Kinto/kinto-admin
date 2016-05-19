import React, { Component } from "react";

import CollectionForm from "./CollectionForm";
import Spinner from "./Spinner";


export default class CollectionCreate extends Component {
  render() {
    const {params, session, createCollection} = this.props;
    const {bid} = params;
    const {busy} = session;
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Create a new collection in <b>{bid}</b> bucket</h1>
        <CollectionForm
          onSubmit={(formData) => createCollection(bid, formData)} />
      </div>
    );
  }
}
