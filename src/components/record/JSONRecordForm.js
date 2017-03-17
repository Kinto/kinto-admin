/* @flow */
import React, { PureComponent } from "react";

import BaseForm from "../BaseForm";
import JSONEditor from "../JSONEditor";
import { validJSON } from "../../utils";

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

export default class JSONRecordForm extends PureComponent {
  props: {
    disabled: boolean,
    record: string, // JSON string representation of a record data
    onSubmit: (data: Object) => void,
    children?: React.Element<*>,
  };

  onSubmit = (data: { formData: string }) => {
    this.props.onSubmit({ ...data, formData: JSON.parse(data.formData) });
  };

  render() {
    const { record, disabled, children } = this.props;
    return (
      <div>
        <BaseForm
          schema={schema}
          formData={record}
          uiSchema={disabled ? { ...uiSchema, "ui:disabled": true } : uiSchema}
          validate={validate}
          onSubmit={this.onSubmit}>
          {children}
        </BaseForm>
      </div>
    );
  }
}
