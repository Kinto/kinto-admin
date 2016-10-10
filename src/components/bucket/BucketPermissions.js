import React, { Component } from "react";
import Form from "react-jsonschema-form";

import Spinner from "../Spinner";
import BucketTabs from "./BucketTabs";

const schema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      principal: {type: "string"},
      read: {type: "boolean"},
      write: {type: "boolean"},
      "collection:create": {type: "boolean"},
      "group:create": {type: "boolean"},
    }
  }
};

function permissionsObjectToList(permissionsObject) {
  return Object.keys(permissionsObject).reduce((acc, permissionName) => {
    const principals = permissionsObject[permissionName];
    for (const principal of principals) {
      const existing = acc.map(x => x.principal).includes(principal);
      if (existing) {
        const permissionEntry = acc.find(x => x.principal === principal);
        acc = acc
          .filter(x => x.principal === principal)
          .concat({...permissionEntry, [permissionName]: true});
      } else {
        acc.push({principal, [permissionName]: true});
      }
      return acc;
    }
  }, []);
}

function permissionsListToObject(permissionsList) {
  return permissionsList.reduce((acc, {principal, ...permissions}) => {
    for (const permissionName of Object.keys(permissions)) {
      if (permissions[permissionName]) {
        acc[permissionName].push(principal);
      }
    }
    return acc;
  }, {
    read: [],
    write: [],
    "collection:create": [],
    "group:create": [],
  });
}

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
