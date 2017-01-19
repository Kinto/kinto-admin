/* @flow */
import React, { Component } from "react";
import Form from "react-jsonschema-form";

import JSONEditor from "../JSONEditor";


const schema = {
  type: "string",
  title: "Raw JSON collection attributes",
  default: "{}",
};

const uiSchema = {
  "ui:widget": JSONEditor,
  "ui:help": "This must be valid JSON.",
};

export default class extends Component {
  props: {
    children?: any, // XXX: would be nice to have an actual type here
    formData: Object,
    onSubmit: (data: {formData: Object}) => void,
  };

  onSubmit = ({formData}: {formData: string}) => {
    this.props.onSubmit({formData: JSON.parse(formData)});
  }

  render() {
    const {children, formData} = this.props;
    return (
      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={JSON.stringify(formData, null, 2)}
        onSubmit={this.onSubmit}>
        {children}
      </Form>
    );
  }
}
