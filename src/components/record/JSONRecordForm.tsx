import React from "react";
import BaseForm from "../BaseForm";
import JSONEditor from "../JSONEditor";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

const schema: RJSFSchema = {
  type: "string",
  title: "JSON record",
  default: "{}",
};

const uiSchema:UiSchema = {
  data: {
    "ui:widget": JSONEditor,
    "ui:help": "This must be valid JSON.",
  },
};

type Props = {
  disabled: boolean;
  record: string; // JSON string representation of a record data
  onSubmit: (data: Object) => void;
  children?: React.ReactNode;
};

export default function JSONRecordForm({
  disabled,
  record,
  onSubmit,
  children,
}: Props) {
  const handleOnSubmit = data => {
    onSubmit({ ...data, formData: JSON.parse(data.formData) });
  };

  return (
    <div>
      <BaseForm
        schema={schema}
        formData={record}
        uiSchema={disabled ? { ...uiSchema, "ui:readonly": true } : uiSchema}
        onSubmit={handleOnSubmit}
      >
        {children}
      </BaseForm>
    </div>
  );
}
