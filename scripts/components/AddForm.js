import React, { Component } from "react";
import { Link } from "react-router";
import Form from "react-jsonschema-form";

import Spinner from "./Spinner";


export default class AddForm extends Component {
  onSubmit = ({formData}) => {
    const {params, createRecord} = this.props;
    const {bid, cid} = params;
    createRecord(bid, cid, formData);
  }

  render() {
    const {params, collection} = this.props;
    const {schema, uiSchema, busy} = collection;
    const {bid, cid} = params;
    return (
      <div>
        <h1>Add a new record in {bid}/{cid}</h1>
        {busy ? <Spinner /> :
          <Form
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={this.onSubmit}>
            <input type="submit" className="btn btn-primary" value="Create" />
            {" or "}
            <Link to={`/buckets/${bid}/collections/${cid}`}>Cancel</Link>
          </Form>}
      </div>
    );
  }
}
