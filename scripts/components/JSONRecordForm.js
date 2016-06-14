import React, { Component } from "react";
import Form from "react-jsonschema-form";

import JSONEditor from "./JSONEditor";
import { validJSON } from "./../utils";


const schema = {
  type: "string",
  title: "JSON record",
  default: "{}",
};

const uiSchema = {
  "ui:widget": JSONEditor,
  "ui:help": "This must be valid JSON.",
};

function validate(json, errors) {
  if (!validJSON(json)) {
    errors.addError("Invalid JSON.");
  }
  return errors;
}

export default class JSONRecordForm extends Component {
  onSubmit = (data) => {
    this.props.onSubmit({...data, formData: JSON.parse(data.formData)});
  }

  render() {
    const {record, disabled, children} = this.props;
    return (
      <div>
        <Form
          schema={schema}
          formData={record}
          uiSchema={disabled ? {...uiSchema, "ui:disabled": true} : uiSchema}
          validate={validate}
          onSubmit={this.onSubmit}>
          {children}
        </Form>
      </div>
    );
  }
}
