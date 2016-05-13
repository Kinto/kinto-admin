import React, { Component } from "react";

import CollectionForm from "./CollectionForm";


export default class CollectionCreate extends Component {
  render() {
    const {params, createCollection} = this.props;
    const {bid} = params;
    return (
      <div>
        <h1>Create a new collection in <code>{bid}</code></h1>
        <CollectionForm
          onSubmit={({formData}) => createCollection(bid, formData)} />
      </div>
    );
  }
}
