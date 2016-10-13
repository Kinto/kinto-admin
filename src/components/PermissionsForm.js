import React, { Component } from "react";
import Form from "react-jsonschema-form";

import {
  permissionsToFormData,
  formDataToPermissions,
  preparePermissionsForm,
} from "../permission";

export default class PermissionsForm extends Component {
  onSubmit = ({formData}) => {
    this.props.onSubmit({formData: formDataToPermissions(formData)});
  }

  render() {
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
