/* @flow */

import React, { Component } from "react";
import Form from "react-jsonschema-form";

import {
  permissionsToFormData,
  formDataToPermissions,
  preparePermissionsForm,
} from "../permission";

export default class PermissionsForm extends Component {
  props: {
    permissions: Object,
    acls: string[],
    onSubmit: Function,
  };

  onSubmit = ({formData}: {formData: Object}) => {
    this.props.onSubmit({formData: formDataToPermissions(formData)});
  }

  render() {
    if (this.props.readonly) {
      return (
        <div className="alert alert-warning">
          You don't have the required permission to edit the permissions for this resource.
        </div>
      );
    }

    const {permissions, acls} = this.props;
    const formData = permissionsToFormData(permissions);
    const {schema, uiSchema} = preparePermissionsForm(acls);
    return (
      <Form className="permissions-form"
            schema={schema}
            uiSchema={uiSchema}
            formData={formData}
            onSubmit={this.onSubmit} />
    );
  }
}
