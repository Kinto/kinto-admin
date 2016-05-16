import React, { Component } from "react";
import { Link } from "react-router";
import Form from "react-jsonschema-form";

import Spinner from "./Spinner";
import JSONEditor from "./JSONEditor";


export default class BulkForm extends Component {
  onSubmit = ({formData}) => {
    const {params, collection, notifyError, bulkCreateRecords} = this.props;
    const {bid, cid} = params;
    const {schema} = collection;

    if (formData.length === 0) {
      return notifyError({message: "The form is empty."});
    }

    if (Object.keys(schema).length === 0) {
      console.log("yooo");
      return bulkCreateRecords(bid, cid, formData.map(json => JSON.parse(json)));
    }

    bulkCreateRecords(bid, cid, formData);
  }

  render() {
    const {params, collection} = this.props;
    const {schema, uiSchema, busy} = collection;
    const {bid, cid} = params;

    let bulkSchema, bulkUiSchema, bulkFormData;

    if (Object.keys(schema).length !== 0) {
      bulkSchema = {
        type: "array",
        definitions: schema.definitions,
        items: schema
      };
      bulkUiSchema = {
        items: uiSchema
      };
      bulkFormData = [{}, {}];
    } else {
      bulkSchema = {
        type: "array",
        items: {
          type: "string",
          default: "{}"
        }
      };
      bulkUiSchema = {
        items: {
          "ui:widget": JSONEditor
        }
      };
      bulkFormData = ["{}", "{}"];
    }

    return (
      <div>
        <h1>Bulk {bid}/{cid} creation</h1>
        {busy ? <Spinner /> :
          <Form
            schema={bulkSchema}
            uiSchema={bulkUiSchema}
            formData={bulkFormData}
            onSubmit={this.onSubmit}>
            <input type="submit" className="btn btn-primary"
              value="Bulk create" />
            {" or "}
            <Link to={`/buckets/${bid}/collections/${cid}`}>Cancel</Link>
          </Form>}
      </div>
    );
  }
}
