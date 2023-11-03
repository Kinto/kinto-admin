import React from "react";

import { Trash } from "react-bootstrap-icons";

import BaseForm from "../BaseForm";
import { RJSFSchema } from "@rjsf/utils";

const deleteSchema: RJSFSchema = {
  type: "string",
  title: "Please enter the bucket id to delete as a confirmation",
};

export default function DeleteForm({ bid, onSubmit }) {
  const validate = (formData, errors) => {
    if (formData !== bid) {
      errors.addError("The bucket id does not match.");
    }
    return errors;
  };

  return (
    <div className="card border-danger">
      <div className="alert-danger card-header">
        <strong>Danger Zone</strong>
      </div>
      <div className="card-body">
        <p>
          Delete the <b>{bid}</b> bucket and all the collections and records it
          contains.
        </p>
        <BaseForm
          schema={deleteSchema}
          customValidate={validate}
          onSubmit={({ formData }) => {
            if (typeof onSubmit === "function") {
              onSubmit(formData);
            }
          }}
        >
          <button type="submit" className="btn btn-danger">
            <Trash className="icon" /> Delete bucket
          </button>
        </BaseForm>
      </div>
    </div>
  );
}
