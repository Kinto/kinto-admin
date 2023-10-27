import React from "react";

export function FormInstructions({ onSchemalessLinkClick }) {
  return (
    <div className="alert alert-info">
      <ol>
        <li>First find a good name for your collection.</li>
        <li>
          Create a <em>JSON schema</em> describing the fields the collection
          records should have.
        </li>
        <li>
          Define a <em>uiSchema</em> to customize the way forms for creating and
          editing records are rendered.
        </li>
        <li>
          List the record fields you want to display in the columns of the
          collection records list.
        </li>
        <li>Decide if you want to enable attaching a file to records.</li>
      </ol>
      <p>
        Alternatively, you can create a{" "}
        <a href="" onClick={onSchemalessLinkClick}>
          schemaless collection
        </a>
        .
      </p>
    </div>
  );
}
