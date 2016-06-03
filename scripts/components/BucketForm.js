import React, { Component } from "react";
import { Link } from "react-router";
import Form from "react-jsonschema-form";

import JSONEditor from "./JSONEditor";
import { validJSON } from "./../utils";


const schema = {
  type: "object",
  title: "Bucket properties",
  required: ["name"],
  properties: {
    name: {
      type: "string",
      title: "Bucket name",
      pattern: "^[a-zA-Z0-9][a-zA-Z0-9_-]*$",
    },
    data: {
      type: "string",
      title: "Bucket metadata (JSON)",
      default: "{}",
    },
  }
};

const uiSchema = {
  data: {
    "ui:widget": JSONEditor,
  },
};

function validate({data}, errors) {
  if (!validJSON(data)) {
    errors.data.addError("Invalid JSON.");
  }
  return errors;
}

export default class BucketForm extends Component {
  onSubmit = ({formData}) => {
    this.props.onSubmit({
      ...formData,
      // Parse JSON fields so they can be sent to the server
      data: JSON.parse(formData.data),
    });
  }

  render() {
    const {formData} = this.props;
    // Disable edition of the collection name
    const _uiSchema = !formData ? uiSchema : {
      ...uiSchema,
      name: {
        "ui:readonly": true,
      }
    };

    const buttons = (
      <div>
        <input type="submit" className="btn btn-primary"
          value={`${formData ? "Update" : "Create"} bucket`} />
        {" or "}
        <Link to="/">Cancel</Link>
      </div>
    );

    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <Form
            schema={schema}
            uiSchema={_uiSchema}
            formData={formData}
            validate={validate}
            onSubmit={this.onSubmit}>
            {buttons}
          </Form>
        </div>
      </div>
    );
  }
}
