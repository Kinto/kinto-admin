import React, { Component } from "react";
import { Link } from "react-router";
import Form from "react-jsonschema-form";

import Spinner from "./Spinner";
import JSONRecordForm from "./JSONRecordForm";


export default class RecordForm extends Component {
  onSubmit = ({formData}) => {
    this.props.onSubmit(formData);
  }

  getForm() {
    const {bid, cid, collection, record} = this.props;
    const {schema, uiSchema, busy} = collection;

    if (busy) {
      return <Spinner />;
    }

    const buttons = (
      <div>
        <input type="submit" className="btn btn-primary"
          value={record ? "Update" : "Create"} />
        {" or "}
        <Link to={`/buckets/${bid}/collections/${cid}`}>Cancel</Link>
      </div>
    );

    if (Object.keys(schema).length === 0) {
      return (
        <JSONRecordForm
          record={JSON.stringify(record, null, 2)}
          onSubmit={this.onSubmit}>
          {buttons}
        </JSONRecordForm>
      );
    }

    return (
      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={record}
        onSubmit={this.onSubmit}>
        {buttons}
      </Form>
    );
  }

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          {this.getForm()}
        </div>
      </div>
    );
  }
}
