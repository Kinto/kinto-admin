import DeleteForm from "./DeleteForm";
import { RJSFSchema } from "@rjsf/utils";
import BaseForm from "@src/components/BaseForm";
import JSONEditor from "@src/components/JSONEditor";
import Spinner from "@src/components/Spinner";
import { useBucket } from "@src/hooks/bucket";
import { canEditBucket } from "@src/permission";
import type { BucketData, BucketState, SessionState } from "@src/types";
import { omit } from "@src/utils";
import React from "react";
import { Check2 } from "react-bootstrap-icons";
import { Link, useParams } from "react-router";

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
  session: SessionState;
  formData?: BucketData;
  deleteBucket?: (bid: string) => any;
  onSubmit: (data: any) => any;
};

export default function BucketForm({ session, deleteBucket, onSubmit }: Props) {
  const { bid } = useParams();
  const bucket = useBucket(bid);

  if (bid && !bucket) {
    return <Spinner />;
  }
  const creation = !bid;
  const hasWriteAccess = canEditBucket(session, bid);
  const formIsEditable = creation || hasWriteAccess;
  const showDeleteForm = !creation && hasWriteAccess;

  const formData = bid ? { ...bucket } : {};
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
}
