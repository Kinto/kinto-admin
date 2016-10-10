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
      read: {type: "boolean", default: false},
      write: {type: "boolean", default: false},
      "collection:create": {type: "boolean", default: false},
      "group:create": {type: "boolean", default: false},
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
          <Form schema={schema} formData={formData} onSubmit={this.onSubmit} />
        </BucketTabs>
      </div>
    );
  }
}
