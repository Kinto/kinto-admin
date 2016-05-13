import React, { Component } from "react";

import CollectionForm from "./CollectionForm";


export default class CollectionCreate extends Component {
  render() {
    const {params, createCollection} = this.props;
    const {bucket} = params;
    return (
      <div>
        <h1>Create a new collection in <code>{bucket}</code></h1>
        <CollectionForm
          onSubmit={({formData}) => createCollection(bucket, formData)} />
      </div>
    );
  }
}
