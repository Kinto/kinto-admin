import type { CollectionData } from "../../types";
import { PureComponent } from "react";
import * as React from "react";
import { withTheme } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { Theme as Bootstrap4Theme } from "@rjsf/bootstrap-4";
import validator from "@rjsf/validator-ajv8";

const FormWithTheme = withTheme(Bootstrap4Theme);

import JSONEditor from "../JSONEditor";
import { omit } from "../../utils";

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

const uiSchema = {
  data: {
    "ui:widget": JSONEditor,
    "ui:help": "This must be valid JSON.",
  },
};

type Props = {
  children?: React.ReactNode;
  cid?: string | null;
  formData: CollectionData;
  onSubmit: (data: { formData: CollectionData }) => void;
};

export default class JSONCollectionForm extends PureComponent<Props> {
  onSubmit = ({
    formData,
  }: {
    formData: { id: string; data: string };
  }): void => {
    console.log(formData);
    const collectionData = { ...JSON.parse(formData.data), id: formData.id };
    this.props.onSubmit({ formData: collectionData });
  };

  render() {
    const { children, cid, formData } = this.props;
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
      <FormWithTheme
        schema={schema}
        uiSchema={_uiSchema}
        formData={formDataSerialized}
        validator={validator}
        // @ts-ignore
        onSubmit={this.onSubmit}
      >
        {children}
      </FormWithTheme>
    );
  }
}
