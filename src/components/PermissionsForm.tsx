import BaseForm from "./BaseForm";
import Spinner from "./Spinner";
import { RJSFSchema } from "@rjsf/utils";
import { useGroupList } from "@src/hooks/group";
import {
  formDataToPermissions,
  permissionsToFormData,
  preparePermissionsForm,
} from "@src/permission";
import type { Permissions } from "@src/types";
import React from "react";
import { useParams } from "react-router";

type Props = {
  readonly: boolean;
  permissions: Permissions;
  acls: string[];
  onSubmit: (data: RJSFSchema) => void;
};

export function PermissionsForm({
  readonly,
  permissions,
  acls,
  onSubmit: onSubmit_,
}: Props) {
  const onSubmit = ({ formData }: RJSFSchema) => {
    onSubmit_({ formData: formDataToPermissions(bid, formData) });
  };
  const { bid } = useParams<{ bid: string }>();
  const groups = useGroupList(bid);
  if (!groups) {
    return <Spinner />;
  }
  if (readonly) {
    return (
      <div className="alert alert-warning">
        You don't have the required permission to edit the permissions for this
        resource.
      </div>
    );
  }
  const formData = permissionsToFormData(bid, permissions);
  const { schema, uiSchema } = preparePermissionsForm(acls, groups);
  return (
    <BaseForm
      className="permissions-form"
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      onSubmit={onSubmit}
    />
  );
}
