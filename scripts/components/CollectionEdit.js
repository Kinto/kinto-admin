import React, { Component } from "react";

import CollectionForm from "./CollectionForm";
import Spinner from "./Spinner";


export default class CollectionEdit extends Component {
  onSubmit = (formData) => {
    const {params} = this.props;
    const {bid, cid} = params;
    this.props.updateCollection(bid, cid, formData);
  };

  onDeleteClick = () => {
    const {deleteCollection, params} = this.props;
    const {bid, cid} = params;
    if (confirm("This will delete the collection and all the records it contains. Are you sure?")) {
      deleteCollection(bid, cid);
    }
  };

  render() {
    const {collection} = this.props;
    const {label, schema, uiSchema, displayFields, busy} = collection;
    if (busy) {
      return <Spinner />;
    }
    const formData = {
      name: collection.name,
      displayFields,
      // Stringify JSON fields so they're editable in a text field
      schema: JSON.stringify(schema, null, 2),
      uiSchema: JSON.stringify(uiSchema, null, 2),
    };
    return (
      <div>
        <h1>Edit <b>{label}</b> collection properties</h1>
        <CollectionForm
          formData={formData}
          onSubmit={this.onSubmit} />
        <hr/>
        <div className="panel panel-danger">
          <div className="panel-heading">
            <strong>Danger Zone</strong>
          </div>
          <div className="panel-body">
            <p>
              Delete the collection and all the records it contains.
            </p>
            <button className="btn btn-danger"
              onClick={this.onDeleteClick}>Delete collection</button>
          </div>
        </div>
      </div>
    );
  }
}
