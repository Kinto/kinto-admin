import type {
  SessionState,
  BucketState,
  CollectionState,
  CollectionData,
} from "../../types";

import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Check2 } from "react-bootstrap-icons";

import BaseForm from "../BaseForm";
import { RJSFSchema } from "@rjsf/utils";
import JSONCollectionForm from "./JSONCollectionForm";
import JSONEditor from "../JSONEditor";
import { canCreateCollection, canEditCollection } from "../../permission";
import { validateSchema, validateUiSchema } from "../../utils";
import DeleteForm from "./DeleteForm";
import { FormInstructions } from "./FormInstructions";

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

const schema: RJSFSchema = {
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
      "ui:title": "Field name",
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

type Props = {
  cid?: string;
  session: SessionState;
  bucket: BucketState;
  collection: CollectionState;
  deleteCollection?: (cid: string) => any;
  onSubmit: (formData: CollectionData) => any;
  formData?: CollectionData;
};

export default function CollectionForm({
  cid,
  session,
  bucket,
  collection,
  deleteCollection,
  onSubmit,
  formData: propFormData = undefined,
}: Props) {
  const [asJSON, setAsJSON] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const allowEditing = propFormData
    ? canCreateCollection(session, bucket)
    : canEditCollection(session, bucket, collection);

  const toggleJSON = event => {
    event.preventDefault();
    setAsJSON(prevAsJSON => !prevAsJSON);
    window.scrollTo(0, 0);
  };

  const onSchemalessLinkClick = event => {
    event.preventDefault();
    setAsJSON(true);
  };

  const handleOnSubmit = ({ formData }) => {
    setShowSpinner(true);
    const collectionData = asJSON
      ? formData
      : {
          ...formData,
          schema: JSON.parse(formData.schema),
          uiSchema: JSON.parse(formData.uiSchema),
        };
    onSubmit(collectionData);
  };

  const creation = !propFormData?.id;
  const showDeleteForm = !creation && allowEditing;
  const formDataSerialized = creation
    ? propFormData
    : {
        displayFields: propFormData.displayFields || [],
        ...propFormData,
        schema: JSON.stringify(propFormData.schema || {}, null, 2),
        uiSchema: JSON.stringify(propFormData.uiSchema || {}, null, 2),
      };

  const _uiSchema = creation
    ? uiSchema
    : {
        ...uiSchema,
        id: {
          "ui:readonly": true,
        },
      };

  const alert =
    allowEditing || bucket.busy || collection.busy ? null : (
      <div className="alert alert-warning">
        You don't have the required permission to edit this collection.
      </div>
    );

  const buttons = (
    <div>
      <button
        type="submit"
        disabled={!allowEditing}
        className="btn btn-primary"
      >
        <Check2 className="icon" />
        {` ${creation ? "Create" : "Update"} collection`}
      </button>
      {" or "}
      <Link to="/">Cancel</Link>
      {" | "}
      <a href="#" onClick={toggleJSON}>
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
          onSubmit={handleOnSubmit}
          showSpinner={showSpinner}
        >
          {buttons}
        </JSONCollectionForm>
      ) : (
        <div>
          <FormInstructions onSchemalessLinkClick={onSchemalessLinkClick} />
          <BaseForm
            schema={schema}
            formData={formDataSerialized}
            uiSchema={
              allowEditing ? _uiSchema : { ..._uiSchema, "ui:disabled": true }
            }
            customValidate={validate}
            // @ts-ignore
            onSubmit={handleOnSubmit}
            showSpinner={showSpinner}
          >
            {buttons}
          </BaseForm>
        </div>
      )}
      {showDeleteForm && <DeleteForm cid={cid} onSubmit={deleteCollection} />}
    </div>
  );
}
