import type {
  SessionState,
  BucketState,
  GroupState,
  GroupData,
} from "../../types";

import React, { PureComponent } from "react";

import { Check2 } from "react-bootstrap-icons";
import { Trash } from "react-bootstrap-icons";

import BaseForm from "../BaseForm";
import AdminLink from "../AdminLink";
import JSONEditor from "../JSONEditor";
import { canCreateGroup, canEditGroup } from "../../permission";
import { validJSON, omit } from "../../utils";
import Spinner from "../Spinner";

const schema = {
  type: "object",
  required: ["id", "members"],
  properties: {
    id: {
      type: "string",
      title: "Group id",
      pattern: "^[a-zA-Z0-9][a-zA-Z0-9_-]*$",
    },
    members: {
      type: "array",
      items: { type: "string" },
      uniqueItems: true,
      default: [],
    },
    data: {
      type: "string",
      title: "Group metadata (JSON)",
      default: "{}",
    },
  },
};

const uiSchema = {
  data: {
    "ui:widget": JSONEditor,
  },
};

const deleteSchema = {
  type: "string",
  title: "Please enter the group id to delete as a confirmation",
};

function validate({ data }, errors) {
  if (!validJSON(data)) {
    errors.data.addError("Invalid JSON.");
  }
  return errors;
}

function DeleteForm({ gid, onSubmit }) {
  const validate = (formData, errors) => {
    if (formData !== gid) {
      errors.addError("The group id does not match.");
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
          Delete the <b>{gid}</b> group.
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
            <Trash className="icon" /> Delete group
          </button>
        </BaseForm>
      </div>
    </div>
  );
}

type Props = {
  bid?: string;
  gid?: string;
  session: SessionState;
  bucket: BucketState;
  group: GroupState;
  formData?: GroupData;
  onSubmit: (formData: GroupData) => any;
  deleteGroup?: (gid: string) => any;
};

export default class GroupForm extends PureComponent<Props> {
  onSubmit = ({ formData }: { formData: { data: string } }) => {
    const { data } = formData;
    // Parse JSON fields so they can be sent to the server
    const attributes = JSON.parse(data);
    this.props.onSubmit({
      ...omit(formData, ["data"]),
      // #273: Ensure omitting "members" value from entered JSON data so we
      // don't override the ones entered in the dedicated field
      ...omit(attributes, ["members"]),
    } as any);
  };

  render() {
    const {
      gid,
      session,
      bucket,
      group,
      formData = {} as GroupData,
      deleteGroup,
    } = this.props;
    const creation = !formData.id;
    const hasWriteAccess = creation
      ? canCreateGroup(session, bucket)
      : canEditGroup(session, bucket, group);
    const formIsEditable = creation || hasWriteAccess;
    const showDeleteForm = !creation && hasWriteAccess;

    // Disable edition of the group id
    const _uiSchema = creation
      ? uiSchema
      : {
          ...uiSchema,
          id: {
            "ui:readonly": true,
          },
        };

    const attributes = omit(formData, ["id", "last_modified", "members"]);
    // Stringify JSON fields so they're editable in a text field
    const data = JSON.stringify(attributes, null, 2);
    const formDataSerialized = {
      ...formData,
      data,
    };

    const alert =
      formIsEditable || group.busy ? null : (
        <div className="alert alert-warning">
          You don't have the required permission to edit this group.
        </div>
      );

    const buttons = (
      <div>
        <button
          type="submit"
          disabled={!formIsEditable}
          className="btn btn-primary"
        >
          <Check2 className="icon" />
          {` ${creation ? "Create" : "Update"} group`}
        </button>
        {" or "}
        <AdminLink name="home" params={{}}>
          Cancel
        </AdminLink>
      </div>
    );

    return (
      <div>
        {alert}
        {group.busy ? (
          <Spinner />
        ) : (
          <BaseForm
            schema={schema}
            uiSchema={
              formIsEditable ? _uiSchema : { ..._uiSchema, "ui:readonly": true }
            }
            formData={formDataSerialized}
            validate={validate}
            onSubmit={this.onSubmit}
          >
            {buttons}
          </BaseForm>
        )}
        {showDeleteForm && <DeleteForm gid={gid} onSubmit={deleteGroup} />}
      </div>
    );
  }
}
