import type {
  SessionState,
  BucketState,
  CollectionState,
  CollectionData,
} from "../../types";

import React, { PureComponent } from "react";
import { Link } from "react-router-dom";

import { Check2 } from "react-bootstrap-icons";
import { Trash } from "react-bootstrap-icons";

import BaseForm from "../BaseForm";
import JSONCollectionForm from "./JSONCollectionForm";
import JSONEditor from "../JSONEditor";
import { canCreateCollection, canEditCollection } from "../../permission";
import { validateSchema, validateUiSchema } from "../../utils";

const defaultSchema = JSON.stringify(
  {
    type: "object",
    properties: {
      title: { type: "string", title: "Title", description: "Short title" },
      content: {
        type: "string",
        title: "Content",
        description: "Provide details...",
      },
    },
  },
  null,
  2
);

const defaultUiSchema = JSON.stringify(
  {
    "ui:order": ["title", "content"],
    content: {
      "ui:widget": "textarea",
    },
  },
  null,
  2
);

const deleteSchema = {
  type: "string",
  title: "Please enter the collection name to delete as a confirmation",
};

function DeleteForm({ cid, onSubmit }) {
  const validate = (formData, errors) => {
    if (formData !== cid) {
      errors.addError("The collection name does not match.");
    }
    return errors;
  };
  return (
    <div className="card border-danger">
      <div className="alert-danger card-header">
        <strong>Danger Zone</strong>
      </div>
      <div className="card-body">
        <p>
          Delete the <b>{cid}</b> collection and all the records it contains.
        </p>
        <BaseForm
          schema={deleteSchema}
          validate={validate}
          onSubmit={({ formData }) => {
            if (typeof onSubmit === "function") {
              onSubmit(formData);
            }
          }}
        >
          <button type="submit" className="btn btn-danger">
            <Trash className="icon" /> Delete collection
          </button>
        </BaseForm>
      </div>
    </div>
  );
}

const schema = {
  type: "object",
  required: ["id"],
  properties: {
    id: {
      type: "string",
      title: "Collection id",
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
    sort: {
      type: "string",
      title: "Sort",
      default: "-last_modified",
    },
    cache_expires: {
      type: "integer",
      title: "Cache expires",
      default: 0,
      description: "client cache header on read-only requests",
    },
    displayFields: {
      type: "array",
      title: "Records list columns",
      description: "fields to list in the record list table",
      default: ["title"],
      minItems: 1,
      items: {
        type: "string",
        minLength: 1,
      },
    },
    attachment: {
      type: "object",
      title: "File attachment",
      description: "Root object for file attachment information",
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
        },
      },
    },
  },
};

const uiSchema = {
  "ui:order": [
    "id",
    "schema",
    "uiSchema",
    "sort",
    "cache_expires",
    "displayFields",
    "attachment",
  ],
  id: {
    "ui:help":
      "The name should only contain letters, numbers, dashes or underscores.",
  },
  schema: {
    "ui:widget": JSONEditor,
    "ui:help": (
      <p>
        This must be a valid
        <a href="http://json-schema.org/" target="_blank">
          {" "}
          JSON schema{" "}
        </a>
        defining an object representing the structure of your collection
        records. You may find this
        <a href="http://jsonschema.net/" target="_blank">
          {" online schema builder "}
        </a>
        useful to create your own.
      </p>
    ),
  },
  attachment: {
    "ui:description": (
      <p>
        Please note this requires the <code>attachments</code> capability to be
        available on the server.
      </p>
    ),
    enabled: {
      "ui:help": "Enable attachment of a single file to records.",
    },
    required: {
      "ui:help":
        "Require a file to be attached to each record in the collection.",
    },
  },
  uiSchema: {
    "ui:widget": JSONEditor,
    "ui:help": (
      <p>
        Learn more about
        <a href="https://git.io/vrbKn" target="_blank">
          {" "}
          what a uiSchema is{" "}
        </a>{" "}
        and how to leverage it to enhance how JSON schema forms are rendered in
        the admin.
      </p>
    ),
  },
  sort: {
    "ui:help": (
      <p>
        The record field name the list should be sorted on by default. Prefix
        the field name with <code>-</code> to sort by descending order.
      </p>
    ),
  },
  displayFields: {
    items: {
      "ui:placeholder": "Enter a field name. i.e: name, attachment.filename",
    },
    "ui:description": (
      <p>
        Pick the JSON schema field names you want to see listed in the records
        list table.{" "}
        <em>
          Hint: These are the keys of the root <code>properties</code> object,
          but may also be other existing property names of your records.
        </em>
      </p>
    ),
    "ui:help": (
      <p>
        This field allows defining the record object properties to display as
        columns in the main records list table. You must define at least one
        display field.
      </p>
    ),
  },
  cache_expires: {
    "ui:description": (
      <p>
        {"(in seconds) add "}
        <a href="https://kinto.readthedocs.io/en/stable/api/1.x/collections.html#collection-caching">
          client cache headers on read-only requests
        </a>
        .
      </p>
    ),
  },
};

function validate({ schema, uiSchema, displayFields }, errors) {
  try {
    validateSchema(schema);
  } catch (error) {
    errors.schema.addError(error);
    return errors;
  }
  try {
    validateUiSchema(uiSchema, schema);
  } catch (error) {
    errors.uiSchema.addError(error);
  }
  return errors;
}

function FormInstructions({ onSchemalessLinkClick }) {
  return (
    <div className="alert alert-info">
      <ol>
        <li>First find a good name for your collection.</li>
        <li>
          Create a <em>JSON schema</em> describing the fields the collection
          records should have.
        </li>
        <li>
          Define a <em>uiSchema</em> to customize the way forms for creating and
          editing records are rendered.
        </li>
        <li>
          List the record fields you want to display in the columns of the
          collection records list.
        </li>
        <li>Decide if you want to enable attaching a file to records.</li>
      </ol>
      <p>
        Alternatively, you can create a{" "}
        <a href="" onClick={onSchemalessLinkClick}>
          schemaless collection
        </a>
        .
      </p>
    </div>
  );
}

type Props = {
  cid?: string;
  bid?: string;
  session: SessionState;
  bucket: BucketState;
  collection: CollectionState;
  deleteCollection?: (cid: string) => any;
  onSubmit: (formData: CollectionData) => any;
  formData?: CollectionData;
};

type State = {
  asJSON: boolean;
};

export default class CollectionForm extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { asJSON: false };
  }

  onSubmit = ({ formData }: { formData: any }): void => {
    const collectionData = this.state.asJSON
      ? formData
      : {
          ...formData,
          // Parse JSON fields so they can be sent to the server
          schema: JSON.parse(formData.schema),
          uiSchema: JSON.parse(formData.uiSchema),
        };
    this.props.onSubmit(collectionData);
  };

  get allowEditing(): boolean {
    const { formData, session, bucket, collection } = this.props;
    const creation = !formData;
    if (creation) {
      return canCreateCollection(session, bucket);
    } else {
      return canEditCollection(session, bucket, collection);
    }
  }

  toggleJSON = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ): void => {
    event.preventDefault();
    this.setState({ asJSON: !this.state.asJSON });
    window.scrollTo(0, 0);
  };

  onSchemalessLinkClick = (event: Event): void => {
    event.preventDefault();
    this.setState({ asJSON: true });
  };

  render() {
    const {
      cid,
      bucket,
      collection,
      formData = {},
      deleteCollection,
    } = this.props;
    const creation = !formData.id;
    const showDeleteForm = !creation && this.allowEditing;
    const { asJSON } = this.state;

    // Disable edition of the collection id
    const _uiSchema = creation
      ? uiSchema
      : {
          ...uiSchema,
          id: {
            "ui:readonly": true,
          },
        };

    const formDataSerialized = creation
      ? formData
      : {
          displayFields: formData.displayFields || [],
          ...formData,
          // Stringify JSON fields so they're editable in a text field
          schema: JSON.stringify(formData.schema || {}, null, 2),
          uiSchema: JSON.stringify(formData.uiSchema || {}, null, 2),
        };

    const alert =
      this.allowEditing || bucket.busy || collection.busy ? null : (
        <div className="alert alert-warning">
          You don't have the required permission to edit this collection.
        </div>
      );

    const buttons = (
      <div>
        <button
          type="submit"
          disabled={!this.allowEditing}
          className="btn btn-primary"
        >
          <Check2 className="icon" />
          {` ${creation ? "Create" : "Update"} collection`}
        </button>
        {" or "}
        <Link to="/">Cancel</Link>
        {" | "}
        <a href="#" onClick={this.toggleJSON}>
          {asJSON ? "Edit form" : "Edit raw JSON"}
        </a>
      </div>
    );

    return (
      <div>
        {alert}
        {asJSON ? (
          <JSONCollectionForm
            cid={cid}
            formData={collection.data}
            onSubmit={this.onSubmit}
          >
            {buttons}
          </JSONCollectionForm>
        ) : (
          <div>
            <FormInstructions
              onSchemalessLinkClick={this.onSchemalessLinkClick}
            />
            <BaseForm
              schema={schema}
              formData={formDataSerialized}
              uiSchema={
                this.allowEditing
                  ? _uiSchema
                  : { ..._uiSchema, "ui:disabled": true }
              }
              validate={validate}
              onSubmit={this.onSubmit}
            >
              {buttons}
            </BaseForm>
          </div>
        )}
        {showDeleteForm && <DeleteForm cid={cid} onSubmit={deleteCollection} />}
      </div>
    );
  }
}
