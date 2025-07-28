import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import BaseForm from "@src/components/BaseForm";
import React from "react";
import { Trash } from "react-bootstrap-icons";

const deleteSchema: RJSFSchema = {
  type: "string",
  title: "Please enter the collection name to delete as a confirmation",
};

export default function DeleteForm({ cid, onSubmit }) {
  const validate = (formData, errors) => {
    if (formData !== cid) {
      errors.addError("The collection name does not match.");
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
          Delete the <b>{cid}</b> collection and all the records it contains.
        </p>
        <BaseForm
          schema={deleteSchema}
          customValidate={validate}
          onSubmit={(evt: IChangeEvent<any>) => {
            if (typeof onSubmit === "function") {
              const { formData } = evt;
              onSubmit(formData);
            }
          }}
        >
          <button type="submit" className="btn btn-danger">
            <Trash className="icon" /> Delete collection
          </button>
        </BaseForm>
      </div>
    </div>
  );
}
