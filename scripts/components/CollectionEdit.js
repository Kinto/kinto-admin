import React, { Component } from "react";
import Form from "react-jsonschema-form";

import CollectionForm from "./CollectionForm";
import Spinner from "./Spinner";


const deleteSchema = {
  type: "string",
  title: "Please enter the collection name to delete as a confirmation",
};

function DeleteForm({cid, onSubmit}) {
  const validate = (formData, errors) => {
    if (formData !== cid) {
      errors.addError("The collection name does not match.");
    }
    return errors;
  };
  return (
    <Form
      schema={deleteSchema}
      validate={validate}
      onSubmit={({formData}) => onSubmit(formData)}>
      <button type="submit" className="btn btn-danger">Delete collection</button>
    </Form>
  );
}

export default class CollectionEdit extends Component {
  onSubmit = (formData) => {
    const {params} = this.props;
    const {bid, cid} = params;
    this.props.updateCollection(bid, cid, formData);
  };

  deleteCollection = (cid) => {
    const {deleteCollection, params} = this.props;
    const {bid} = params;
    if (confirm("This will delete the collection and all the records it contains. Are you sure?")) {
      deleteCollection(bid, cid);
    }
  };

  render() {
    const {params, collection} = this.props;
    const {cid} = params;
    const {schema={}, uiSchema={}, displayFields=[], label, busy} = collection;
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
              Delete the <b>{label}</b> collection and all the records it contains.
            </p>
            <DeleteForm cid={cid} onSubmit={this.deleteCollection} />
          </div>
        </div>
      </div>
    );
  }
}
