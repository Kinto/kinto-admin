import React, { Component } from "react";

import CollectionForm from "./CollectionForm";


export default class CollectionEdit extends Component {
  componentDidMount() {
    const {params} = this.props;
    const {bucket, collection} = params;
    this.props.loadCollectionProperties(bucket, collection);
  }

  render() {
    const {params, updateCollection, collectionProperties} = this.props;
    const {bucket, collection} = params;
    return (
      <div>
        <h1>Update <code>{bucket}/{collection}</code> collection properties</h1>
        <CollectionForm
          formData={collectionProperties}
          onSubmit={({formData}) => updateCollection(bucket, formData)} />
      </div>
    );
  }
}
