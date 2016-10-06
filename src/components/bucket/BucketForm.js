import React, { Component } from "react";
import { Link } from "react-router";
import Form from "react-jsonschema-form";

import JSONEditor from "../JSONEditor";
import Spinner from "../Spinner";
import { canEditBucket } from "../../permission";
import { validJSON, omit } from "../../utils";


const schema = {
  type: "object",
  title: "Bucket properties",
  required: ["id"],
  properties: {
    id: {
      type: "string",
      title: "Bucket name",
      pattern: "^[a-zA-Z0-9][a-zA-Z0-9_-]*$",
    },
    data: {
      type: "string",
      title: "Bucket metadata (JSON)",
      default: "{}",
    },
  }
};

const uiSchema = {
  data: {
    "ui:widget": JSONEditor,
  },
};

const deleteSchema = {
  type: "string",
  title: "Please enter the bucket name to delete as a confirmation",
};

function validate({data}, errors) {
  if (!validJSON(data)) {
    errors.data.addError("Invalid JSON.");
  }
  return errors;
}

function DeleteForm({bid, onSubmit}) {
  const validate = (formData, errors) => {
    if (formData !== bid) {
      errors.addError("The bucket name does not match.");
    }
    return errors;
  };
  return (
    <div className="panel panel-danger">
      <div className="panel-heading">
        <strong>Danger Zone</strong>
      </div>
      <div className="panel-body">
        <p>
          Delete the <b>{bid}</b> bucket and all the collections and
          records it contains.
        </p>
        <Form
          schema={deleteSchema}
          validate={validate}
          onSubmit={({formData}) => onSubmit(formData)}>
          <button type="submit" className="btn btn-danger">Delete bucket</button>
        </Form>
      </div>
    </div>
  );
}

export default class BucketForm extends Component {
  onSubmit = ({formData}) => {
    this.props.onSubmit({
      ...omit(formData, ["data"]),
      // Parse JSON fields so they can be sent to the server
      ...JSON.parse(formData.data)
    });
  }

  render() {
    const {bid, session, bucket, formData, deleteBucket} = this.props;
    const creation = !formData;
    const hasWriteAccess = canEditBucket(session, bucket);
    const formIsEditable = creation || hasWriteAccess;
    const showDeleteForm = !creation && hasWriteAccess;

    const formDataSerialized = {
      ...formData,
      // Stringify JSON fields so they're editable in a text field
      data: JSON.stringify(formData.data || {}, null, 2),
    };

    // Disable edition of the collection id
    const _uiSchema = creation ? uiSchema : {
      ...uiSchema,
      id: {
        "ui:readonly": true,
      }
    };

    const alert = formIsEditable || bucket.busy ? null : (
      <div className="alert alert-warning">
        You don't have the required permission to edit this bucket.
      </div>
    );

    const buttons = (
      <div>
        <input type="submit" disabled={!formIsEditable}
          className="btn btn-primary"
          value={`${creation ? "Create" : "Update"} bucket`} />
        {" or "}
        <Link to="/">Cancel</Link>
      </div>
    );

    return (
      <div>
        {alert}
        {bucket.busy ?
          <Spinner /> :
          <Form
            schema={schema}
            uiSchema={formIsEditable ? _uiSchema :
                        {..._uiSchema, "ui:readonly": true}}
            formData={formDataSerialized}
            validate={validate}
            onSubmit={this.onSubmit}>
            {buttons}
          </Form>
        }
        {showDeleteForm ?
          <DeleteForm
            bid={bid}
            onSubmit={deleteBucket} /> : null}
      </div>
    );
  }
}
