import { RJSFSchema, UiSchema } from "@rjsf/utils";
import BaseForm from "@src/components/BaseForm";
import JSONEditor from "@src/components/JSONEditor";
import { omit } from "@src/utils";
import React from "react";

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
  let jsRecord = JSON.parse(record);
  const attachment = jsRecord.attachment;
  jsRecord = omit(jsRecord, ["attachment"]);
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
  const _uiSchema = attachmentEnabled ? uiSchemaWithUpload : uiSchema;
  const _record: any | string = attachmentEnabled
    ? splitAttachment(record)
    : record;
  const _schema = attachmentEnabled ? schemaWithUpload : schema;
  if (attachmentEnabled && attachmentRequired) {
    _schema.required.push("__attachment__");
  }

  const handleOnSubmit = data => {
    const formData = attachmentEnabled
      ? {
          ...JSON.parse(data.formData.jsonContent),
          attachment: _record?.attachment,
          __attachment__: data.formData.__attachment__,
        }
      : JSON.parse(data.formData);
    onSubmit({ ...data, formData });
  };

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
