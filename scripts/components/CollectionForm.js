import React, { Component } from "react";
import Form from "react-jsonschema-form";

import JSONEditor from "./JSONEditor";
import { validJSON, validateSchema } from "./../utils";


const defaultSchema = JSON.stringify({
  type: "object",
  properties: {
    field1: {type: "string"},
    field2: {type: "string"},
  }
}, null, 2);

const defaultUiSchema = JSON.stringify({
  "ui:order": ["field1", "field2"],
  field2: {
    "ui:widget": "textarea"
  }
}, null, 2);

const schema = {
  type: "object",
  title: "Collection properties",
  required: ["name"],
  properties: {
    name: {
      type: "string",
      title: "Collection name",
      pattern: "^[a-zA-Z0-9][a-zA-Z0-9_-]*$",
    },
    schema: {
      type: "string",
      title: "JSON schema",
      default: defaultSchema,
    },
    uiSchema: {
      type: "string",
      title: "UI schema",
      default: defaultUiSchema,
    },
    displayFields: {
      type: "array",
      default: ["field1", "field2"],
      minItems: 1,
      items: {
        type: "string",
        description: "Enter a field name. i.e: name, attachment.filename",
      }
    },
  }
};

const uiSchema = {
  name: {
    "ui:help": "The name should only contain letters, numbers, dashes or underscores."
  },
  schema: {
    "ui:widget": JSONEditor,
    "ui:help": (
      <p>
        This must be a valid
        <a href="http://json-schema.org/" target="_blank"> JSON schema </a>
        defining an object representing the structure of your collection records.
        You may find this
        <a href="http://jsonschema.net/" target="_blank"> online schema builder </a>
        useful to create your own.
      </p>
    )
  },
  uiSchema: {
    "ui:widget": JSONEditor,
    "ui:help": (
      <p>
        Learn more about
        <a href="https://git.io/vrbKn" target="_blank"> what a uiSchema is </a> and
        how to leverage it to enhance how JSON schema forms are rendered in the admin.
      </p>
    )
  },
  displayFields: {
    "ui:help": (
      <p>
        This field allows defining the record object properties to display as
        columns in the main records list table. You must define at least one
        display field.
      </p>
    )
  }
};

function validate({schema, uiSchema, displayFields}, errors) {
  try {
    validateSchema(schema);
  } catch(error) {
    errors.schema.addError(error);
  }
  if (!validJSON(uiSchema)) {
    errors.uiSchema.addError("Invalid JSON.");
  }
  return errors;
}

export default class CollectionForm extends Component {
  onSubmit = ({formData}) => {
    this.props.onSubmit({
      ...formData,
      // Parse JSON fields so they can be sent to the server
      schema: JSON.parse(formData.schema),
      uiSchema: JSON.parse(formData.uiSchema),
    });
  }

  render() {
    const {formData} = this.props;
    // Disable edition of the collection name
    const _uiSchema = !formData ? uiSchema : {
      ...uiSchema,
      name: {
        "ui:readonly": true,
      }
    };
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <Form
            schema={schema}
            formData={formData}
            uiSchema={_uiSchema}
            validate={validate}
            onSubmit={this.onSubmit} />
        </div>
      </div>
    );
  }
}
