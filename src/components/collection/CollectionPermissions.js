import React, { Component } from "react";
import Form from "react-jsonschema-form";

import Spinner from "../Spinner";
import CollectionTabs from "./CollectionTabs";

import {
  permissionsObjectToList,
  permissionsListToObject,
  preparePermissionsForm,
} from "../../permission";

export default class CollectionPermissions extends Component {
  onSubmit = ({formData}) => {
    const {params, updateCollection} = this.props;
    const {bid, cid} = params;
    updateCollection(bid, cid, {
      permissions: permissionsListToObject(formData),
    });
  }

  render() {
    const {params, capabilities, collection} = this.props;
    const {bid, cid} = params;
    const {busy, permissions} = collection;
    const formData = permissionsObjectToList(permissions);
    const {schema, uiSchema} = preparePermissionsForm([
      "read",
      "write",
      "record:create",
    ]);
    if (busy) {
      return <Spinner />;
    }
    return (
      <div>
        <h1>Permissions for <b>{bid}/{cid} collection</b></h1>
        <CollectionTabs
          bid={bid}
          capabilities={capabilities}
          selected="permissions">
          <Form
            className="permissions-form"
            schema={schema}
            uiSchema={uiSchema}
            formData={formData}
            onSubmit={this.onSubmit} />
        </CollectionTabs>
      </div>
    );
  }
}
