import React, { Component } from "react";
import Form from "react-jsonschema-form";

import Spinner from "../Spinner";
import GroupTabs from "./GroupTabs";

import {
  permissionsObjectToList,
  permissionsListToObject,
  preparePermissionsForm,
} from "../../permission";

export default class GroupPermissions extends Component {
  onSubmit = ({formData}) => {
    const {params, updateGroup} = this.props;
    const {bid, gid} = params;
    updateGroup(bid, gid, {
      permissions: permissionsListToObject(formData),
    });
  }

  render() {
    const {params, capabilities, group} = this.props;
    const {bid, gid} = params;
    const {busy, permissions} = group;
    const formData = permissionsObjectToList(permissions);
    const {schema, uiSchema} = preparePermissionsForm([
      "read",
      "write",
    ]);
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Permissions for <b>{bid}/{gid} group</b></h1>
        <GroupTabs
          bid={bid}
          capabilities={capabilities}
          selected="permissions">
          <Form
            className="permissions-form"
            schema={schema}
            uiSchema={uiSchema}
            formData={formData}
            onSubmit={this.onSubmit} />
        </GroupTabs>
      </div>
    );
  }
}
