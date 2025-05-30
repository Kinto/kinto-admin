import DeleteForm from "./DeleteForm";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { getClient } from "@src/client";
import AdminLink from "@src/components/AdminLink";
import BaseForm from "@src/components/BaseForm";
import JSONEditor from "@src/components/JSONEditor";
import Spinner from "@src/components/Spinner";
import { useAppSelector } from "@src/hooks/app";
import { useGroup } from "@src/hooks/group";
import { canCreateGroup, canEditGroup } from "@src/permission";
import { omit } from "@src/utils";
import React, { useState } from "react";
import { Check2 } from "react-bootstrap-icons";
import { useNavigate, useParams } from "react-router";

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

export default function GroupForm() {
  const { bid, gid } = useParams();
  const [cacheVal, setCacheVal] = useState(0);
  const group = useGroup(bid, gid, cacheVal);
  const navigate = useNavigate();
  const session = useAppSelector(state => state.session);

  const onSubmit = async ({ formData }) => {
    const { data } = formData;
    const attributes = JSON.parse(data);
    const toSave = {
      // #273: Ensure omitting "members" value from entered JSON data so we
      // don't override the ones entered in the dedicated field
      ...omit(formData, ["data"]),
      ...omit(attributes, ["members"]),
    };

    if (!gid) {
      getClient().bucket(bid).createGroup(toSave.id, toSave.members, {
        data: toSave,
        safe: true,
      });
      navigate(`/buckets/${bid}/groups/${toSave.id}`);
    } else {
      getClient().bucket(bid).updateGroup(toSave, {
        safe: true,
      });
      setCacheVal(cacheVal + 1);
    }
  };

  const deleteGroup = async () => {
    await getClient().bucket(bid).deleteGroup(gid);
    navigate(`/buckets/${bid}/groups`);
  };

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
      {bid && gid && !group ? (
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
