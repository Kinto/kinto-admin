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

type Props = {
  readonly: boolean;
  permissions: Permissions;
  acls: string[];
  onSubmit: (data: { formData: Object }) => void;
};

export const PermissionsForm = ({
  readonly,
  permissions,
  acls,
  onSubmit: onSubmit_,
}: Props) => {
  const onSubmit = ({ formData }: { formData: Object }) => {
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
};
