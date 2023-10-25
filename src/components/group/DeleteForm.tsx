import React from "react";

import { Trash } from "react-bootstrap-icons";

import BaseForm from "../BaseForm";

import { RJSFSchema } from "@rjsf/utils";

const deleteSchema: RJSFSchema = {
  type: "string",
  title: "Please enter the group id to delete as a confirmation",
};

export default function DeleteForm({ gid, onSubmit }) {
  const validate = (formData, errors) => {
    if (formData !== gid) {
      errors.addError("The group id does not match.");
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
          Delete the <b>{gid}</b> group.
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
            <Trash className="icon" /> Delete group
          </button>
        </BaseForm>
      </div>
    </div>
  );
}
