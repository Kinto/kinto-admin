import Form from "react-jsonschema-form";

import React from "react";


const schema = {
  type: "object",
  title: "Setup",
  required: ["name"],
  properties: {
    name:   {
      type: "string",
      title: "Collection name",
    },
  }
};

function CollectionInfo(props) {
  const {logout, session} = props;
  const {username, serverInfo} = session;
  return (
    <div>
      <p>Welcome back, <strong>{username}</strong> (
        <a href="#"
          onClick={(event) => event.preventDefault() || logout()}>logout</a>
      ).</p>
      <h3>Server information</h3>
      <pre>{JSON.stringify(serverInfo, null, 2)}</pre>
    </div>
  );
}

export default function CollectionCreate(props) {
  const {params, createCollection} = props;
  const {bucket} = params;
  return (
    <div>
      <h1>Create a new collection in <code>{bucket}</code></h1>
      <Form
        schema={schema}
        onSubmit={({formData}) => createCollection(bucket, formData)} />
    </div>
  );
}
