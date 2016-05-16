import React, { Component } from "react";
import { Link } from "react-router";
import Form from "react-jsonschema-form";

import Spinner from "./Spinner";


export default class BulkForm extends Component {
  onSubmit = ({formData}) => {
    const {params, notifyError, bulkCreateRecords} = this.props;
    const {bid, cid} = params;
    if (formData.length > 0) {
      bulkCreateRecords(bid, cid, formData);
    } else {
      notifyError({message: "The form is empty."});
    }
  }

  render() {
    const {params, collection} = this.props;
    const {schema, uiSchema, busy} = collection;
    const {bid, cid} = params;
    const bulkSchema = {
      type: "array",
      definitions: schema.definitions,
      items: schema
    };
    const bulkUiSchema = {items: uiSchema};
    const bulkFormData = [{}, {}];
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
