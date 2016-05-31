import React, { Component } from "react";
import Form from "react-jsonschema-form";

import JSONEditor from "./JSONEditor";
import { validJSON } from "./../utils";


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
      default: "{}",
    },
    uiSchema: {
      type: "string",
      title: "UI schema",
      default: "{}",
    },
    displayFields: {
      type: "array",
      items: {
        type: "string",
        description: "Enter a field name. i.e: name, attachment.filename"
      }
    },
  }
};

const uiSchema = {
  schema: {
    "ui:widget": JSONEditor,
  },
  uiSchema: {
    "ui:widget": JSONEditor,
  }
};

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
