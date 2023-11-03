import type { Permissions } from "../types";

import React from "react";

import BaseForm from "./BaseForm";
import {
  permissionsToFormData,
  formDataToPermissions,
  preparePermissionsForm,
} from "../permission";
import { useParams } from "react-router";
import { useAppSelector } from "../hooks";

import { RJSFSchema } from "@rjsf/utils";

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
