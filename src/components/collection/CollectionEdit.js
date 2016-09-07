import React, { Component } from "react";

import Spinner from "../Spinner";
import CollectionForm from "./CollectionForm";
import CollectionTabs from "./CollectionTabs";


export default class CollectionEdit extends Component {
  onSubmit = (formData) => {
    const {params, updateCollection} = this.props;
    const {bid, cid} = params;
    updateCollection(bid, cid, formData);
  };

  deleteCollection = (cid) => {
    const {deleteCollection, params} = this.props;
    const {bid} = params;
    if (confirm("This will delete the collection and all the records it contains. Are you sure?")) {
      deleteCollection(bid, cid);
    }
  };

  render() {
    const {params, session, bucket, collection, capabilities} = this.props;
    const {bid, cid} = params;
    const {busy, id, data} = collection;
    const {
      schema = {},
      uiSchema = {},
      attachment = {},
      displayFields = [],
      sort,
    } = data;

    if (busy) {
      return <Spinner />;
    }

    const formData = {
      id,
      displayFields,
      attachment,
      sort,
      // Stringify JSON fields so they're editable in a text field
      schema: JSON.stringify(schema, null, 2),
      uiSchema: JSON.stringify(uiSchema, null, 2),
    };

    return (
      <div>
        <h1>Edit <b>{bid}/{cid}</b> collection properties</h1>
        <CollectionTabs
          bid={bid}
          cid={cid}
          selected="settings"
          capabilities={capabilities}>
          <CollectionForm
            bid={bid}
            cid={cid}
            session={session}
            bucket={bucket}
            collection={collection}
            deleteCollection={this.deleteCollection}
            formData={formData}
            onSubmit={this.onSubmit} />
        </CollectionTabs>
      </div>
    );
  }
}
