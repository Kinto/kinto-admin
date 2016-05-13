import React, { Component } from "react";

import Form from "react-jsonschema-form";


const schema = {
  type: "object",
  title: "Collection properties",
  required: ["name"],
  properties: {
    name: {
      type: "string",
      title: "Collection name",
    },
    schema: {
      type: "string",
      title: "JSON schema",
    },
    uiSchema: {
      type: "string",
      title: "UI schema",
    },
    displayFields: {
      type: "array",
      items: {
        type: "string"
      }
    },
  }
};

const uiSchema = {
  schema: {
    "ui:widget": "textarea",
  },
  uiSchema: {
    "ui:widget": "textarea",
  },
};

function validJSON(string) {
  try {
    JSON.parse(string);
    return true;
  } catch(err) {
    return false;
  }
}

function validate({schema, uiSchema}, errors) {
  if (!validJSON(schema)) {
    errors.schema.addError("Invalid JSON.");
  }
  if (!validJSON(uiSchema)) {
    errors.uiSchema.addError("Invalid JSON.");
  }
  return errors;
}

export default class CollectionForm extends Component {
  render() {
    const {onSubmit} = this.props;
    return (
      <Form
        schema={schema}
        uiSchema={uiSchema}
        validate={validate}
        onSubmit={onSubmit} />
    );
  }
}
