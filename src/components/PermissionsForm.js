/* @flow */

import type { Permissions, GroupData } from "../types";

import React, { Component } from "react";
import Form from "react-jsonschema-form";

import {
  permissionsToFormData,
  formDataToPermissions,
  preparePermissionsForm,
} from "../permission";

export default class PermissionsForm extends Component {
  props: {
    bid: string,
    readonly: boolean,
    permissions: Permissions,
    groups: GroupData[],
    acls: string[],
    onSubmit: (data: {formData: Object}) => void,
  };

  onSubmit = ({formData}: {formData: Object}) => {
    const {bid, onSubmit} = this.props;
    onSubmit({formData: formDataToPermissions(bid, formData)});
  }

  render() {
    const {bid, readonly} = this.props;
    if (readonly) {
      return (
        <div className="alert alert-warning">
          You don't have the required permission to edit the permissions for this resource.
        </div>
      );
    }

    const {permissions, acls, groups} = this.props;
    const formData = permissionsToFormData(bid, permissions);
    const {schema, uiSchema} = preparePermissionsForm(acls, groups);
    return (
      <Form className="permissions-form"
            schema={schema}
            uiSchema={uiSchema}
            formData={formData}
            onSubmit={this.onSubmit} />
    );
  }
}
