import DeleteForm from "./DeleteForm";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import AdminLink from "@src/components/AdminLink";
import BaseForm from "@src/components/BaseForm";
import JSONEditor from "@src/components/JSONEditor";
import Spinner from "@src/components/Spinner";
import { useGroup } from "@src/hooks/group";
import { canCreateGroup, canEditGroup } from "@src/permission";
import type {
  BucketState,
  GroupData,
  GroupState,
  SessionState,
} from "@src/types";
import { omit } from "@src/utils";
import React, { useCallback } from "react";
import { Check2 } from "react-bootstrap-icons";
import { useParams } from "react-router";

const schema: RJSFSchema = {
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
      items: {
        type: "string",
        title: "Member name",
      },
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

const uiSchema: UiSchema = {
  data: {
    "ui:widget": JSONEditor,
  },
};

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

export default function GroupForm(props: Props) {
  const { bid, gid } = useParams();
  const group = useGroup(bid, gid);

  const { session, onSubmit: propOnSubmit, deleteGroup } = props;

  const onSubmit = useCallback(
    ({ formData }) => {
      const { data } = formData;
      const attributes = JSON.parse(data);
      propOnSubmit({
        // #273: Ensure omitting "members" value from entered JSON data so we
        // don't override the ones entered in the dedicated field
        ...omit(formData, ["data"]),
        ...omit(attributes, ["members"]),
      } as any);
    },
    [propOnSubmit]
  );

  const creation = !gid;
  const hasWriteAccess = creation
    ? canCreateGroup(session, bid)
    : canEditGroup(session, bid, gid);
  const formIsEditable = creation || hasWriteAccess;
  const showDeleteForm = !creation && hasWriteAccess;

  const _uiSchema = creation
    ? uiSchema
    : {
        ...uiSchema,
        id: {
          "ui:readonly": true,
        },
      };

  const formData = bid && gid && group?.data ? { ...group.data } : {};
  const attributes = omit(formData, ["id", "last_modified", "members"]);
  const data = JSON.stringify(attributes, null, 2);
  const formDataSerialized = {
    ...formData,
    data,
  };

  const alert =
    formIsEditable || !group ? null : (
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
      {!group ? (
        <Spinner />
      ) : (
        <BaseForm
          schema={schema}
          uiSchema={
            formIsEditable ? _uiSchema : { ..._uiSchema, "ui:readonly": true }
          }
          formData={formDataSerialized}
          onSubmit={onSubmit}
        >
          {buttons}
        </BaseForm>
      )}
      {showDeleteForm && <DeleteForm gid={gid} onSubmit={deleteGroup} />}
    </div>
  );
}
