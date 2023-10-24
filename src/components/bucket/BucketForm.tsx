import React from "react";
import { Link } from "react-router-dom";

import { Check2 } from "react-bootstrap-icons";

import BaseForm from "../BaseForm";
import JSONEditor from "../JSONEditor";
import Spinner from "../Spinner";
import { RJSFSchema } from "@rjsf/utils";
import { canEditBucket } from "../../permission";
import { omit } from "../../utils";
import DeleteForm from "./DeleteForm";
import type { BucketState, BucketData, SessionState } from "../../types";

const schema: RJSFSchema = {
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

type Props = {
  bid?: string;
  session: SessionState;
  bucket: BucketState;
  formData?: BucketData;
  deleteBucket?: (bid: string) => any;
  onSubmit: (data: any) => any;
};

const BucketForm: React.FC<Props> = ({
  bid,
  session,
  bucket,
  formData = {},
  deleteBucket,
  onSubmit,
}) => {
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

  const alert =
    formIsEditable || bucket.busy ? null : (
      <div className="alert alert-warning">
        You don't have the required permission to edit this bucket.
      </div>
    );

  const buttons = (
    <div>
      <button
        type="submit"
        disabled={!formIsEditable}
        className="btn btn-primary"
      >
        <Check2 className="icon" />
        {` ${creation ? "Create" : "Update"} bucket`}
      </button>
      {" or "}
      <Link to="/">Cancel</Link>
    </div>
  );

  return (
    <div>
      {alert}
      {bucket.busy ? (
        <Spinner />
      ) : (
        <BaseForm
          schema={schema}
          uiSchema={
            formIsEditable ? _uiSchema : { ..._uiSchema, "ui:readonly": true }
          }
          formData={formDataSerialized}
          onSubmit={({ formData }) => {
            const { id, data } = formData;
            // Parse JSON fields so they can be sent to the server
            const attributes = JSON.parse(data);
            onSubmit({ id, ...attributes });
          }}
        >
          {buttons}
        </BaseForm>
      )}
      {showDeleteForm && <DeleteForm bid={bid} onSubmit={deleteBucket} />}
    </div>
  );
};

export default BucketForm;
