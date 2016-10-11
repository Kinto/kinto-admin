import React, { Component } from "react";
import Form from "react-jsonschema-form";

import Spinner from "../Spinner";
import BucketTabs from "./BucketTabs";

import {
  permissionsObjectToList,
  permissionsListToObject,
  preparePermissionsForm,
} from "../../permission";

export default class BucketPermissions extends Component {
  onSubmit = ({formData}) => {
    const {params, updateBucket} = this.props;
    const {bid} = params;
    updateBucket(bid, {
      permissions: permissionsListToObject(formData),
    });
  }

  render() {
    const {params, capabilities, bucket} = this.props;
    const {bid} = params;
    const {busy, permissions} = bucket;
    const formData = permissionsObjectToList(permissions);
    const {schema, uiSchema} = preparePermissionsForm([
      "read",
      "write",
      "collection:create",
      "group:create",
    ]);
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Permissions for <b>{bid}</b> bucket</h1>
        <BucketTabs
          bid={bid}
          capabilities={capabilities}
          selected="permissions">
          <Form
            className="permissions-form"
            schema={schema}
            uiSchema={uiSchema}
            formData={formData}
            onSubmit={this.onSubmit} />
        </BucketTabs>
      </div>
    );
  }
}
