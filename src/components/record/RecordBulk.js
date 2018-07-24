/* @flow */
import type {
  CollectionState,
  RecordData,
  CollectionRouteMatch,
} from "../../types";

import React, { PureComponent } from "react";

import BaseForm from "../BaseForm";
import AdminLink from "../AdminLink";
import Spinner from "../Spinner";
import JSONEditor from "../JSONEditor";
import {
  extendSchemaWithAttachment,
  extendUiSchemaWithAttachment,
} from "./RecordForm";

type Props = {
  match: CollectionRouteMatch,
  collection: CollectionState,
  bulkCreateRecords: (bid: string, cid: string, formData: RecordData[]) => void,
  notifyError: (msg: string, error: ?Error) => void,
};

export default class RecordBulk extends PureComponent<Props> {
  onSubmit = ({ formData }: { formData: any[] }) => {
    const { match, collection, notifyError, bulkCreateRecords } = this.props;
    const {
      params: { bid, cid },
    } = match;
    const {
      data: { schema = {} },
    } = collection;

    if (formData.length === 0) {
      return notifyError("The form is empty.");
    }

    if (Object.keys(schema).length === 0) {
      return bulkCreateRecords(
        bid,
        cid,
        formData.map(json => JSON.parse(json))
      );
    }

    bulkCreateRecords(bid, cid, formData);
  };

  render() {
    const { match, collection } = this.props;
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
        items: extendSchemaWithAttachment(schema, attachment),
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
        {busy ? (
          <Spinner />
        ) : (
          <div className="panel panel-default">
            <div className="panel-body">
              <BaseForm
                schema={bulkSchema}
                uiSchema={bulkUiSchema}
                formData={bulkFormData}
                onSubmit={this.onSubmit}>
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
}
