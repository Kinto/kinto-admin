import React from "react";
import BaseForm from "../BaseForm";
import JSONEditor from "../JSONEditor";
import { RJSFSchema, UiSchema } from "@rjsf/utils";

const schema: RJSFSchema = {
  type: "string",
  title: "JSON record",
  default: "{}",
};

const schemaWithUpload: RJSFSchema = {
  type: "object",
  properties: {
    jsonContent: {
      type: "string",
      title: "JSON record",
      default: "{}",
    },
    __attachment__: {
      type: "string",
      format: "data-url",
      title: "File attachment",
    },
  },
  required: ["jsonContent"],
};

const uiSchemaWithUpload: UiSchema = {
  jsonContent: {
    "ui:help": "This must be valid JSON.",
  },
  "ui:order": ["jsonContent", "__attachment__"],
};

const uiSchema: UiSchema = {
  data: {
    "ui:widget": JSONEditor,
    "ui:help": "This must be valid JSON.",
  },
  "ui:order": [],
};

type Props = {
  disabled: boolean;
  record: string; // JSON string representation of a record data
  attachmentEnabled?: boolean;
  attachmentRequired?: boolean;
  onSubmit: (data: Object) => void;
  children?: React.ReactNode;
};

function splitAttachment(record: string) {
  const jsRecord = JSON.parse(record);
  const attachment = jsRecord.attachment || {};
  if (jsRecord.attachment) {
    delete jsRecord.attachment;
  }
  return {
    attachment: attachment,
    jsonContent: JSON.stringify(jsRecord),
  };
}

export default function JSONRecordForm({
  disabled,
  record,
  onSubmit,
  children,
  attachmentEnabled,
  attachmentRequired,
}: Props) {
  const handleOnSubmit = data => {
    const formData = attachmentEnabled
      ? {
          ...JSON.parse(data.formData.jsonContent),
          __attachment__: data.formData.__attachment__,
        }
      : JSON.parse(data.formData);
    onSubmit({ ...data, formData });
  };

  const _uiSchema = attachmentEnabled ? uiSchemaWithUpload : uiSchema;
  const _record: any | string = attachmentEnabled
    ? splitAttachment(record)
    : record;
  const _schema = attachmentEnabled ? schemaWithUpload : schema;
  if (attachmentEnabled && attachmentRequired) {
    _schema.required.push("__attachment__");
  }

  return (
    <div>
      <BaseForm
        schema={_schema}
        formData={_record}
        uiSchema={disabled ? { ..._uiSchema, "ui:readonly": true } : _uiSchema}
        onSubmit={handleOnSubmit}
        data-testid="JSONRecordForm"
        disabled={disabled}
      >
        {children}
      </BaseForm>
    </div>
  );
}
