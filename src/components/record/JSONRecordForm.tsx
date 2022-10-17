import { PureComponent } from "react";
import * as React from "react";

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

type Props = {
  disabled: boolean;
  record: string; // JSON string representation of a record data
  onSubmit: (data: Object) => void;
  children?: React.ReactNode;
};

export default class JSONRecordForm extends PureComponent<Props> {
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
          onSubmit={this.onSubmit}
        >
          {children}
        </BaseForm>
      </div>
    );
  }
}
