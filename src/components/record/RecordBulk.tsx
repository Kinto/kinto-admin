import {
  extendSchemaWithAttachment,
  extendUiSchemaWithAttachment,
} from "./AttachmentInfo";
import * as CollectionActions from "@src/actions/collection";
import AdminLink from "@src/components/AdminLink";
import BaseForm from "@src/components/BaseForm";
import JSONEditor from "@src/components/JSONEditor";
import Spinner from "@src/components/Spinner";
import { notifyError } from "@src/hooks/notifications";
import type { CollectionRouteMatch, CollectionState } from "@src/types";
import React, { useCallback } from "react";

export type OwnProps = {
  match: CollectionRouteMatch;
};

export type StateProps = {
  collection: CollectionState;
};

export type Props = OwnProps &
  StateProps & {
    bulkCreateRecords: typeof CollectionActions.bulkCreateRecords;
  };

export default function RecordBulk({
  match,
  collection,
  bulkCreateRecords,
}: Props) {
  const onSubmit = useCallback(
    ({ formData }) => {
      const {
        params: { bid, cid },
      } = match;
      const {
        data: { schema = {} },
      } = collection;

      if (formData.length === 0) {
        notifyError("The form is empty.");
        return { type: "noop" };
      }

      if (Object.keys(schema).length === 0) {
        return bulkCreateRecords(
          bid,
          cid,
          formData.map(json => JSON.parse(json))
        );
      }

      bulkCreateRecords(bid, cid, formData);
    },
    [match, collection, bulkCreateRecords]
  );

  const {
    busy,
    data: { schema = {}, uiSchema = {}, attachment },
  } = collection;
  const {
    params: { bid, cid },
  } = match;

  let bulkSchema, bulkUiSchema, bulkFormData;

  if (Object.keys(schema).length !== 0) {
    bulkSchema = {
      type: "array",
      definitions: schema.definitions,
      items: extendSchemaWithAttachment(
        schema,
        attachment,
        {} /* as for create record */
      ),
    };
    bulkUiSchema = {
      items: extendUiSchemaWithAttachment(uiSchema, attachment),
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
      {busy ? (
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
