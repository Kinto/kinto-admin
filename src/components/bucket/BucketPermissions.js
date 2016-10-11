import React, { Component } from "react";
import Form from "react-jsonschema-form";

import Spinner from "../Spinner";
import BucketTabs from "./BucketTabs";

import { permissionsObjectToList, permissionsListToObject } from "../../permission";

const schema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      principal: {type: "string", title: "Principal"},
      permissions: {
        type: "array",
        title: "Permissions",
        items: {
          type: "string",
          enum: ["read", "write", "collection:create", "group:create"],
        },
        uniqueItems: true,
      }
    }
  }
};

const uiSchema = {
  items: {
    permissions: {
      "ui:widget": "checkboxes"
    }
  }
};

export default class BucketPermissions extends Component {
  onSubmit = ({formData}) => {
    const {params, updateBucket} = this.props;
    const {bid} = params;
    updateBucket(bid, undefined, permissionsListToObject(formData));
  }

  render() {
    const {params, capabilities, bucket} = this.props;
    const {bid} = params;
    const {busy, permissions} = bucket;
    const formData = permissionsObjectToList(permissions);
    console.log(permissions,formData);
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
