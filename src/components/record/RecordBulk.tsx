import React, { useCallback, useState } from "react";

import type { CollectionState, CollectionRouteMatch } from "../../types";

import * as CollectionActions from "../../actions/collection";
import * as NotificationActions from "../../actions/notifications";
import BaseForm from "../BaseForm";
import AdminLink from "../AdminLink";
import JSONEditor from "../JSONEditor";
import {
  extendSchemaWithAttachment,
  extendUiSchemaWithAttachment,
} from "./AttachmentInfo";

export type OwnProps = {
  match: CollectionRouteMatch;
};

export type StateProps = {
  collection: CollectionState;
};

export type Props = OwnProps &
  StateProps & {
    bulkCreateRecords: typeof CollectionActions.bulkCreateRecords;
    notifyError: typeof NotificationActions.notifyError;
  };

export default function RecordBulk({
  match,
  collection,
  notifyError,
  bulkCreateRecords,
}: Props) {
  const [showSpinner, setShowSpinner] = useState(false);

  const onSubmit = useCallback(
    ({ formData }) => {
      const {
        params: { bid, cid },
      } = match;
      const {
        data: { schema = {} },
      } = collection;

      if (formData.length === 0) {
        return notifyError("The form is empty.");
      }

      setShowSpinner(true);

      if (Object.keys(schema).length === 0) {
        return bulkCreateRecords(
          bid,
          cid,
          formData.map(json => JSON.parse(json))
        );
      }

      bulkCreateRecords(bid, cid, formData);
    },
    [match, collection, notifyError, bulkCreateRecords]
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

  return (
    <div>
      <h1>
        Bulk{" "}
        <b>
          {bid}/{cid}
        </b>{" "}
        creation
      </h1>
      <div className="card">
        <div className="card-body">
          <BaseForm
            schema={bulkSchema}
            uiSchema={bulkUiSchema}
            formData={bulkFormData}
            onSubmit={onSubmit}
            showSpinner={showSpinner || busy}
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
    </div>
  );
}
