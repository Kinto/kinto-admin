import React, { Component } from "react";
import Form from "react-jsonschema-form";

import Spinner from "./Spinner";
import BucketForm from "./BucketForm";


const deleteSchema = {
  type: "string",
  title: "Please enter the bucket name to delete as a confirmation",
};

function DeleteForm({bid, onSubmit}) {
  const validate = (formData, errors) => {
    if (formData !== bid) {
      errors.addError("The bucket name does not match.");
    }
    return errors;
  };
  return (
    <Form
      schema={deleteSchema}
      validate={validate}
      onSubmit={({formData}) => onSubmit(formData)}>
      <button type="submit" className="btn btn-danger">Delete bucket</button>
    </Form>
  );
}

export default class BucketEditForm extends Component {
  deleteBucket = (bid) => {
    const {deleteBucket} = this.props;
    if (confirm("This will delete the bucket and all the collections and " +
                "records it contains. Are you sure?")) {
      deleteBucket(bid);
    }
  };

  onSubmit = ({name, data}) => {
    const {params, updateBucket} = this.props;
    const {bid} = params;
    updateBucket(bid, data);
  }

  render() {
    const {params, session, bucket} = this.props;
    const {bid} = params;
    const {busy} = session;
    if (busy) {
      return <Spinner />;
    }
    const formData = {
      name: bid,
      // Stringify JSON fields so they're editable in a text field
      // XXX where do we store bucket data?
      data: JSON.stringify(bucket && bucket.data || {}, null, 2),
    };
    return (
      <div>
        <h1>Manage <b>{bid}</b> bucket</h1>
        <BucketForm
          formData={formData}
          onSubmit={this.onSubmit} />
        <div className="panel panel-danger">
          <div className="panel-heading">
            <strong>Danger Zone</strong>
          </div>
          <div className="panel-body">
            <p>
              Delete the <b>{bid}</b> bucket and all the collections and records it contains.
            </p>
            <DeleteForm
              bid={bid}
              onSubmit={this.deleteBucket} />
          </div>
        </div>
      </div>
    );
  }
}
