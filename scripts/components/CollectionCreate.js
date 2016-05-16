import React, { Component } from "react";

import CollectionForm from "./CollectionForm";
import Spinner from "./Spinner";


export default class CollectionCreate extends Component {
  render() {
    const {params, collection, createCollection} = this.props;
    const {bid} = params;
    if (collection.busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Create a new collection in <code>{bid}</code></h1>
        <CollectionForm
          onSubmit={(formData) => createCollection(bid, formData)} />
      </div>
    );
  }
}
