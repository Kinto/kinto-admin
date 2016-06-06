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
    <div className="alert alert-info instructions">
      <ol>
        <li>First find a good name for your collection.</li>
        <li>Create a <em>JSON schema</em> describing the fields the
            collection records should have.</li>
        <li>Define a <em>uiSchema</em> to customize the way forms for creating and
            editing records are rendered.</li>
        <li>List the record fields you want to display in the columns of the
            collection records list.</li>
        <li>Decide if you want to enable attaching a file to records.</li>
      </ol>
    </div>
  );
}

const deleteSchema = {
  type: "string",
  title: "Please enter the collection name to delete as a confirmation",
};

function DeleteForm({cid, onSubmit}) {
  const validate = (formData, errors) => {
    if (formData !== cid) {
      errors.addError("The collection name does not match.");
    }
    return errors;
  };
  return (
    <div className="panel panel-danger">
      <div className="panel-heading">
        <strong>Danger Zone</strong>
      </div>
      <div className="panel-body">
        <p>
          Delete the <b>{cid}</b> collection and all the records it contains.
        </p>
        <Form
          schema={deleteSchema}
          validate={validate}
          onSubmit={({formData}) => onSubmit(formData)}>
          <button type="submit" className="btn btn-danger">Delete collection</button>
        </Form>
      </div>
    </div>
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
    attachment: {
      type: "object",
      title: "File attachment",
      description: (
        <p>
          Please note this requires the <code>attachments</code> capability
          to be available on the server.
        </p>
      ),
      properties: {
        enabled: {
          type: "boolean",
          title: "Enable file attachment",
          default: false,
        },
        required: {
          type: "boolean",
          title: "Attachment required",
          default: false,
        }
      }
    },
  }
};

const uiSchema = {
  "ui:order": ["name", "schema", "uiSchema", "displayFields", "attachment"],
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
    enabled: {
      "ui:help": "Enable attachment of a single file to records.",
    },
    required: {
      "ui:help": "Require a file to be attached to each record in the collection.",
    }
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

  get allowEditing() {
    const {session, collection} = this.props;
    try {
      const collectionWritePermissions = collection.permissions.write;
      const currentUserId = session.serverInfo.user.id;
      return collectionWritePermissions.includes(currentUserId);
    } catch(err) {
      return false;
    }
  }

  render() {
    const {cid, collection, formData, deleteCollection} = this.props;
    const creation = !formData;
    const formIsEditable = creation || this.allowEditing;

    // Disable edition of the collection name
    const _uiSchema = !formData ? uiSchema : {
      ...uiSchema,
      name: {
        "ui:readonly": true,
      }
    };

    const alert = formIsEditable || collection.busy ? null : (
      <div className="alert alert-warning">
        You don't have the required permission to edit this collection.
      </div>
    );

    const buttons = (
      <div>
        <input type="submit" className="btn btn-primary" disabled={!formIsEditable}
          value={`${formData ? "Update" : "Create"} collection`} />
        {" or "}
        <Link to="/">Cancel</Link>
      </div>
    );

    return (
      <div>
        <div className="panel panel-default">
          <div className="panel-body">
            {alert}
            <Form
              schema={schema}
              formData={formData}
              uiSchema={formIsEditable ? _uiSchema :
                                         {..._uiSchema, "ui:disabled": true}}
              validate={validate}
              onSubmit={this.onSubmit}>
              {buttons}
            </Form>
          </div>
        </div>
        {this.allowEditing ?
          <DeleteForm
            cid={cid}
            onSubmit={deleteCollection} /> : null}
      </div>
    );
  }
}
