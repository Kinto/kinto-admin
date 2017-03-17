/* @flow */
import type { BucketState, BucketData, SessionState } from "../../types";

import React, { PureComponent } from "react";
import { Link } from "react-router";

import BaseForm from "../BaseForm";
import JSONEditor from "../JSONEditor";
import Spinner from "../Spinner";
import { canEditBucket } from "../../permission";
import { validJSON, omit } from "../../utils";

const schema = {
  type: "object",
  required: ["id"],
  properties: {
    id: {
      type: "string",
      title: "Bucket id",
      pattern: "^[a-zA-Z0-9][a-zA-Z0-9_-]*$",
    },
    data: {
      type: "string",
      title: "Bucket metadata (JSON)",
      default: "{}",
    },
  },
};

const uiSchema = {
  data: {
    "ui:widget": JSONEditor,
  },
};

const deleteSchema = {
  type: "string",
  title: "Please enter the bucket id to delete as a confirmation",
};

function validate({ data }, errors) {
  if (!validJSON(data)) {
    errors.data.addError("Invalid JSON.");
  }
  return errors;
}

function DeleteForm({ bid, onSubmit }) {
  const validate = (formData, errors) => {
    if (formData !== bid) {
      errors.addError("The bucket id does not match.");
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
        <BaseForm
          schema={deleteSchema}
          validate={validate}
          onSubmit={({ formData }) => {
            if (typeof onSubmit === "function") {
              onSubmit(formData);
            }
          }}>
          <button type="submit" className="btn btn-danger">
            <i className="glyphicon glyphicon-trash" />{" "}Delete bucket
          </button>
        </BaseForm>
      </div>
    </div>
  );
}

export default class BucketForm extends PureComponent {
  props: {
    bid?: string,
    session: SessionState,
    bucket: BucketState,
    formData?: BucketData,
    deleteBucket?: (bid: string) => void,
    onSubmit: (data: Object) => void,
  };

  onSubmit = ({ formData }: { formData: Object }) => {
    const { id, data } = formData;
    // Parse JSON fields so they can be sent to the server
    const attributes = JSON.parse(data);
    this.props.onSubmit({ id, ...attributes });
  };

  render() {
    const { bid, session, bucket, formData = {}, deleteBucket } = this.props;
    const creation = !formData.id;
    const hasWriteAccess = canEditBucket(session, bucket);
    const formIsEditable = creation || hasWriteAccess;
    const showDeleteForm = !creation && hasWriteAccess;

    const attributes = omit(formData, ["id", "last_modified"]);
    // Stringify JSON fields so they're editable in a text field
    const data = JSON.stringify(attributes, null, 2);
    const formDataSerialized = {
      id: bid,
      data,
    };

    // Disable edition of the collection id
    const _uiSchema = creation
      ? uiSchema
      : {
          ...uiSchema,
          id: {
            "ui:readonly": true,
          },
        };

    const alert = formIsEditable || bucket.busy
      ? null
      : <div className="alert alert-warning">
          You don't have the required permission to edit this bucket.
        </div>;

    const buttons = (
      <div>
        <button
          type="submit"
          disabled={!formIsEditable}
          className="btn btn-primary">
          <i className="glyphicon glyphicon-ok" />
          {` ${creation ? "Create" : "Update"} bucket`}
        </button>
        {" or "}
        <Link to="/">Cancel</Link>
      </div>
    );

    return (
      <div>
        {alert}
        {bucket.busy
          ? <Spinner />
          : <BaseForm
              schema={schema}
              uiSchema={
                formIsEditable
                  ? _uiSchema
                  : { ..._uiSchema, "ui:readonly": true }
              }
              formData={formDataSerialized}
              validate={validate}
              onSubmit={this.onSubmit}>
              {buttons}
            </BaseForm>}
        {showDeleteForm && <DeleteForm bid={bid} onSubmit={deleteBucket} />}
      </div>
    );
  }
}
