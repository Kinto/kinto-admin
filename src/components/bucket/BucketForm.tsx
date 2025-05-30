import DeleteForm from "./DeleteForm";
import { RJSFSchema } from "@rjsf/utils";
import { getClient } from "@src/client";
import BaseForm from "@src/components/BaseForm";
import JSONEditor from "@src/components/JSONEditor";
import Spinner from "@src/components/Spinner";
import { useAppSelector } from "@src/hooks/app";
import { reloadBuckets, useBucket } from "@src/hooks/bucket";
import { notifyError, notifySuccess } from "@src/hooks/notifications";
import { canEditBucket } from "@src/permission";
import { omit } from "@src/utils";
import React, { useState } from "react";
import { Check2 } from "react-bootstrap-icons";
import { Link, useNavigate, useParams } from "react-router";

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

export default function BucketForm() {
  const { bid } = useParams();
  const [cacheVal, setCacheVal] = useState(0);
  const bucket = useBucket(bid, cacheVal);
  const session = useAppSelector(state => state.session);
  const navigate = useNavigate();

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
    formIsEditable || !bucket ? null : (
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

  const handleOnSubmit = async ({ formData }: RJSFSchema) => {
    const { id, data } = formData;
    const attributes = JSON.parse(data);

    if (creation) {
      try {
        await getClient().createBucket(id, { data: attributes, safe: true });
        navigate(`/buckets/${id}/attributes`);
        notifySuccess("Bucket created.");
        reloadBuckets();
      } catch (ex) {
        notifyError("Bucket creation failed.", ex);
      }
    } else {
      try {
        await getClient()
          .bucket(bid)
          .setData(
            { ...attributes, last_modified: bucket.last_modified },
            { safe: true }
          );
        setCacheVal(cacheVal + 1);
        notifySuccess("Bucket attributes updated.");
        reloadBuckets();
      } catch (ex) {
        notifyError("Bucket attributes failed to update.", ex);
      }
    }
  };

  const handleDelete = async () => {
    await getClient().deleteBucket(bid);
    navigate(`/`);
  };

  return (
    <div>
      {alert}
      {bid && !bucket ? (
        <Spinner />
      ) : (
        <BaseForm
          schema={schema}
          uiSchema={
            formIsEditable ? _uiSchema : { ..._uiSchema, "ui:readonly": true }
          }
          formData={formDataSerialized}
          onSubmit={handleOnSubmit}
        >
          {buttons}
        </BaseForm>
      )}
      {showDeleteForm && <DeleteForm bid={bid} onSubmit={handleDelete} />}
    </div>
  );
}
