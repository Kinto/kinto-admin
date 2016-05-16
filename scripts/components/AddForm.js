import React, { Component } from "react";
import { Link } from "react-router";
import Form from "react-jsonschema-form";

import Spinner from "./Spinner";
import JSONRecordForm from "./JSONRecordForm";


export default class AddForm extends Component {
  onSubmit = ({formData}) => {
    const {params, createRecord} = this.props;
    const {bid, cid} = params;
    createRecord(bid, cid, formData);
  }

  getContent() {
    const {params, collection} = this.props;
    const {schema, uiSchema, busy} = collection;
    const {bid, cid} = params;

    if (busy) {
      return <Spinner />;
    }

    const buttons = (
      <div>
        <input type="submit" className="btn btn-primary" value="Create" />
        {" or "}
        <Link to={`/buckets/${bid}/collections/${cid}`}>Cancel</Link>
      </div>
    );

    if (Object.keys(schema).length === 0) {
      return (
        <JSONRecordForm onSubmit={this.onSubmit}>
          {buttons}
        </JSONRecordForm>
      );
    }

    return (
      <Form schema={schema} uiSchema={uiSchema} onSubmit={this.onSubmit}>
        {buttons}
      </Form>
    );
  }

  render() {
    const {params} = this.props;
    const {bid, cid} = params;
    return (
      <div>
        <h1>Add a new record in {bid}/{cid}</h1>
        <div className="panel panel-default">
          <div className="panel-body">
            {this.getContent()}
          </div>
        </div>
      </div>
    );
  }
}
