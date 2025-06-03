import {
  extendSchemaWithAttachment,
  extendUiSchemaWithAttachment,
} from "./AttachmentInfo";
import { getClient } from "@src/client";
import AdminLink from "@src/components/AdminLink";
import BaseForm from "@src/components/BaseForm";
import JSONEditor from "@src/components/JSONEditor";
import Spinner from "@src/components/Spinner";
import { useCollection } from "@src/hooks/collection";
import { notifyError, notifySuccess } from "@src/hooks/notifications";
import { useServerInfo } from "@src/hooks/session";
import React from "react";
import { useNavigate, useParams } from "react-router";

export default function RecordBulk() {
  const { bid, cid } = useParams();
  const collection = useCollection(bid, cid);
  const navigate = useNavigate();
  const serverInfo = useServerInfo();

  const onSubmit = async ({ formData }) => {
    if (formData.length === 0) {
      notifyError("The form is empty.");
      return;
    }

    const col = getClient().bucket(bid).collection(cid);

    try {
      for (const rawRecord of formData) {
        if (
          rawRecord.__attachment__ &&
          serverInfo &&
          "attachments" in serverInfo.capabilities
        ) {
          const { __attachment__: attachment, ...record } = rawRecord;
          await col.addAttachment(attachment, record);
        } else {
          await col.createRecord(rawRecord);
        }
      }
      notifySuccess(`All ${formData.length} records created.`);
    } catch (ex) {
      notifyError("Unable to create some records.", ex);
    }
    navigate(`/buckets/${bid}/collections/${cid}/records/`);
  };

  let bulkSchema, bulkUiSchema, bulkFormData;

  if (collection && Object.keys(collection.schema).length !== 0) {
    bulkSchema = {
      type: "array",
      definitions: collection?.schema?.definitions,
      items: extendSchemaWithAttachment(
        collection?.schema,
        collection?.attachment,
        {} /* as for create record */
      ),
    };
    bulkUiSchema = {
      items: extendUiSchemaWithAttachment(
        collection.uiSchema,
        collection.attachment
      ),
    };
    bulkFormData = [{}, {}];
  } else {
    bulkSchema = {
      type: "array",
      items: {
        type: "string",
        title: "JSON record",
        default: "{}",
      },
    };
    bulkUiSchema = {
      items: {
        "ui:widget": JSONEditor,
      },
    };
    bulkFormData = ["{}", "{}"];
  }

  const formCrashMsg = (
    <div>
      This is likely caused by a bad <code>ui:widget</code> value in this{" "}
      <AdminLink name="collection:attributes" params={{ bid, cid }}>
        collection's UI schema
      </AdminLink>
      .
    </div>
  );

  return (
    <div>
      <h1>
        Bulk{" "}
        <b>
          {bid}/{cid}
        </b>{" "}
        creation
      </h1>
      {!collection ? (
        <Spinner />
      ) : (
        <div className="card">
          <div className="card-body">
            <BaseForm
              schema={bulkSchema}
              uiSchema={bulkUiSchema}
              formData={bulkFormData}
              onSubmit={onSubmit}
              formCrashMsg={formCrashMsg}
            >
              <input
                type="submit"
                className="btn btn-primary"
                value="Bulk create"
              />
              {" or "}
              <AdminLink name="collection:records" params={{ bid, cid }}>
                Cancel
              </AdminLink>
            </BaseForm>
          </div>
        </div>
      )}
    </div>
  );
}
