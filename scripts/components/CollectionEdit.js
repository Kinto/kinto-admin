import React, { Component } from "react";

import CollectionForm from "./CollectionForm";


export default class CollectionEdit extends Component {
  onSubmit = ({formData}) => {
    const {params} = this.props;
    const {bid, cid} = params;
    this.props.updateCollectionProperties(bid, cid, {
      ...formData,
      // Parse JSON fields so they can be sent to the server
      schema: JSON.parse(formData.schema),
      uiSchema: JSON.parse(formData.uiSchema),
    });
  };

  render() {
    const {params, collection} = this.props;
    const {bid, cid} = params;
    if (!collection.name) {
      // XXX loading spinner
      return null;
    }
    const formData = {
      name: collection.name,
      displayFields: collection.displayFields,
      // Stringify JSON fields so they're editable in a text field
      schema: JSON.stringify(collection.schema, null, 2),
      uiSchema: JSON.stringify(collection.uiSchema, null, 2),
    };
    return (
      <div>
        <h1>Update <code>{bid}/{cid}</code> collection properties</h1>
        <CollectionForm
          formData={formData}
          onSubmit={this.onSubmit} />
      </div>
    );
  }
}
