import { useAppSelector } from "../hooks/app";
import {
  formDataToPermissions,
  permissionsToFormData,
  preparePermissionsForm,
} from "../permission";
import type { Permissions } from "../types";
import BaseForm from "./BaseForm";
import { RJSFSchema } from "@rjsf/utils";
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
  const groups = useAppSelector(store => store.bucket.groups);
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
