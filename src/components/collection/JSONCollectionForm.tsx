import { Theme as Bootstrap4Theme } from "@rjsf/bootstrap-4";
import { withTheme } from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import JSONEditor from "@src/components/JSONEditor";
import Spinner from "@src/components/Spinner";
import type { CollectionData } from "@src/types";
import { omit } from "@src/utils";
import React, { useState } from "react";

const FormWithTheme = withTheme(Bootstrap4Theme);

const schema: RJSFSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: {
      type: "string",
      title: "Collection id",
      pattern: "^[a-zA-Z0-9][a-zA-Z0-9_-]*$",
    },
    data: {
      type: "string",
      title: "Collection metadata (JSON)",
      default: "{}",
    },
  },
};

const uiSchema: UiSchema = {
  data: {
    "ui:widget": JSONEditor,
    "ui:help": "This must be valid JSON.",
  },
};

type Props = {
  children?: React.ReactNode;
  cid?: string | null;
  disabled?: boolean;
  formData: CollectionData;
  onSubmit: (data: { formData: CollectionData }) => void;
};

export default function JSONCollectionForm({
  children,
  cid,
  formData,
  onSubmit,
  disabled,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = ({
    formData: formInput,
  }: {
    formData: { id: string; data: string };
  }) => {
    setIsSubmitting(true);
    const collectionData = { ...JSON.parse(formInput.data), id: formInput.id };
    onSubmit({ formData: collectionData });
  };

  const creation = !cid;
  const attributes = omit(formData, ["id", "last_modified"]);
  // Stringify JSON fields so they're editable in a text field
  const data = JSON.stringify(attributes, null, 2);
  const formDataSerialized = {
    id: cid,
    data,
  };

  // Disable edition of the collection id
  const _uiSchema = creation
    ? uiSchema
    : {
        ...uiSchema,
        id: {
          "ui:readonly": true,
        },
      };

  return (
    <div className="formWrapper">
      <FormWithTheme
        schema={schema}
        uiSchema={_uiSchema}
        formData={formDataSerialized}
        validator={validator}
        // @ts-ignore
        onSubmit={handleSubmit}
        disabled={disabled || isSubmitting}
      >
        {children}
      </FormWithTheme>
      {isSubmitting && <Spinner />}
    </div>
  );
}
