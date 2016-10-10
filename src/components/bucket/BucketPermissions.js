import React, { Component } from "react";
import Form from "react-jsonschema-form";

import Spinner from "../Spinner";
import BucketTabs from "./BucketTabs";

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

function permissionsObjectToList(permissionsObject) {
  return Object.keys(permissionsObject)
    .reduce((acc, permissionName) => {
      const principals = permissionsObject[permissionName];
      for (const principal of principals) {
        const existing = acc.find(x => x.principal === principal);
        if (existing) {
          acc =  acc.map(perm => {
            if (perm.principal === principal) {
              return {...existing, [permissionName]: true};
            } else {
              return perm;
            }
          });
        } else {
          acc = [...acc, {principal, [permissionName]: true}];
        }
      }
      return acc;
    }, [])
    // Ensure entries are always listed alphabetically by principals, to avoid
    // confusing UX.
    .sort((a, b) => a.principal > b.principal);
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
