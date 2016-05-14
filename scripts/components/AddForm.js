import React, { Component } from "react";
import { Link } from "react-router";
import Form from "react-jsonschema-form";

export default class AddForm extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.name && nextProps.schema;
  }

  onSubmit(data) {
    this.props.create(data.formData);
  }

  render() {
    const {collection} = this.props;
    const {name, schema, uiSchema} = collection;
    return (
      <div>
        <h1>{name}</h1>
        <Form
          schema={schema}
          uiSchema={uiSchema}
          onSubmit={this.onSubmit.bind(this)}>
          <input type="submit" className="btn btn-primary" value="Create" />
          {" or "}
          <Link to={`/collections/${name}`}>Cancel</Link>
        </Form>
      </div>
    );
  }
}
