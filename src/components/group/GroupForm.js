import React, { Component } from "react";
import { Link } from "react-router";
import Form from "react-jsonschema-form";

import JSONEditor from "../JSONEditor";
import { canCreateGroup, canEditGroup } from "../../permission";
import { validJSON, omit } from "../../utils";
import Spinner from "../Spinner";


const schema = {
  type: "object",
  title: "Group properties",
  required: ["name", "members"],
  properties: {
    name: {
      type: "string",
      title: "Group name",
      pattern: "^[a-zA-Z0-9][a-zA-Z0-9_-]*$",
    },
    members: {
      type: "array",
      items: { "type": "string" },
      uniqueItems: true,
      default: [],
    },
    data: {
      type: "string",
      title: "Group metadata (JSON)",
      default: "{}",
    },
  }
};

const uiSchema = {
  data: {
    "ui:widget": JSONEditor,
  },
};

const deleteSchema = {
  type: "string",
  title: "Please enter the bucket name to delete as a confirmation",
};

function validate({data}, errors) {
  if (!validJSON(data)) {
    errors.data.addError("Invalid JSON.");
  }
  return errors;
}

function DeleteForm({gid, onSubmit}) {
  const validate = (formData, errors) => {
    if (formData !== gid) {
      errors.addError("The group name does not match.");
    }
    return errors;
  };
  return (
    <div className="panel panel-danger">
      <div className="panel-heading">
        <strong>Danger Zone</strong>
      </div>
      <div className="panel-body">
        <p>
          Delete the <b>{gid}</b> group.
        </p>
        <Form
          schema={deleteSchema}
          validate={validate}
          onSubmit={({formData}) => onSubmit(formData)}>
          <button type="submit" className="btn btn-danger">Delete group</button>
        </Form>
      </div>
    </div>
  );
}

export default class GroupForm extends Component {
  onSubmit = ({formData}) => {
    const {name, data} = formData;
    const groupData = omit(formData, ["name", "data"]);
    this.props.onSubmit({
      id: name,
      ...groupData,
      // Parse JSON fields so they can be sent to the server
      ...JSON.parse(data),
    });
  }

  render() {
    const {gid, session, bucket, group, formData, deleteGroup} = this.props;
    const creation = !formData;
    const hasWriteAccess = creation ? canCreateGroup(session, bucket)
                                    : canEditGroup(session, bucket, group);
    const formIsEditable = creation || hasWriteAccess;
    const showDeleteForm = !creation && hasWriteAccess;

    // Disable edition of the collection name
    const _uiSchema = creation ? uiSchema : {
      ...uiSchema,
      name: {
        "ui:readonly": true,
      }
    };

    const formDataSerialized = creation ? formData : {
      ...formData,
      // Stringify JSON fields so they're editable in a text field
      data: JSON.stringify(formData.data || {}, null, 2),
    };

    const alert = formIsEditable || group.busy ? null : (
      <div className="alert alert-warning">
        You don't have the required permission to edit this group.
      </div>
    );

    const buttons = (
      <div>
        <input type="submit" disabled={!formIsEditable}
          className="btn btn-primary"
          value={`${creation ? "Create" : "Update"} group`} />
        {" or "}
        <Link to="/">Cancel</Link>
      </div>
    );

    return (
      <div>
        {alert}
        {group.busy ?
          <Spinner/> :
          <Form
            schema={schema}
            uiSchema={formIsEditable ? _uiSchema :
                        {..._uiSchema, "ui:readonly": true}}
            formData={formDataSerialized}
            validate={validate}
            onSubmit={this.onSubmit}>
            {buttons}
          </Form>
            }
        {showDeleteForm ?
          <DeleteForm
            gid={gid}
            onSubmit={deleteGroup} /> : null}
      </div>
    );
  }
}
