import React, { Component } from "react";
import { Link } from "react-router";
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

function FormInstructions() {
  return (
    <ol>
      <li>First find a good name for your collection.</li>
      <li>Create a <em>JSON schema</em> describing the fields the
          collection records should have.</li>
      <li>Decide if you want to enable attaching a file to records.</li>
      <li>Define a <em>uiSchema</em> to customize the way forms for creating and
          editing records are rendered.</li>
      <li>List the record fields you want to display in the columns of the
          collection records list.</li>
    </ol>
  );
}

const schema = {
  type: "object",
  title: "Collection properties",
  description: FormInstructions(),
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
    attachment: {
      type: "boolean",
      title: "Enable file attachment",
      default: false,
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
  "ui:order": ["name", "schema", "attachment", "uiSchema", "displayFields"],
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
  attachment: {
    "ui:help": "Enable a single file upload per record.",
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

    const buttons = (
      <div>
        <input type="submit" className="btn btn-primary"
          value={`${formData ? "Update" : "Create"} collection`} />
        {" or "}
        <Link to="/">Cancel</Link>
      </div>
    );

    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <Form
            schema={schema}
            formData={formData}
            uiSchema={_uiSchema}
            validate={validate}
            onSubmit={this.onSubmit}>
            {buttons}
          </Form>
        </div>
      </div>
    );
  }
}
