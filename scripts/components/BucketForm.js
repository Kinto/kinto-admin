import React, { Component } from "react";
import Form from "react-jsonschema-form";


const schema = {
  type: "object",
  title: "Bucket properties",
  required: ["name"],
  properties: {
    name: {
      type: "string",
      title: "Bucket name",
    },
  }
};

export default class BucketForm extends Component {
  onSubmit = ({formData}) => this.props.onSubmit(formData);

  render() {
    const {formData} = this.props;
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <Form
            schema={schema}
            formData={formData}
            onSubmit={this.onSubmit} />
        </div>
      </div>
    );
  }
}
