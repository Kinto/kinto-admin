import React, { Component } from "react";
import { Link } from "react-router";
import Form from "react-jsonschema-form";

import Spinner from "./Spinner";
import { omit } from "../utils";


function recordToFormData(record) {
  return omit(record, ["id", "last_modified", "schema"]);
}

export default class EditForm extends Component {
  onSubmit = ({formData}) => {
    const {params, updateRecord} = this.props;
    const {bid, cid, rid} = params;
    updateRecord(bid, cid, rid, formData);
  }

  render() {
    const {params, collection, record} = this.props;
    const {schema, uiSchema, busy} = collection;
    const {bid, cid, rid} = params;
    return (
      <div>
        <h1>{bid}/{cid}/{rid}</h1>
        {busy ? <Spinner /> :
          <Form
            formData={recordToFormData(record)}
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={this.onSubmit}>
            <input type="submit" className="btn btn-primary" value="Update" />
            {" or "}
            <Link to={`/buckets/${bid}/collections/${cid}`}>Cancel</Link>
          </Form>}
      </div>
    );
  }
}
