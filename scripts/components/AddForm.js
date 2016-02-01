import React,{ Component } from "react";
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
    const {name, schema, uiSchema} = this.props;
    return (
      <div>
        <h1>{name}</h1>
        <Link to={`/collections/${name}`}>&laquo; Back</Link>
        <Form
          schema={schema}
          uiSchema={uiSchema}
          onSubmit={this.onSubmit.bind(this)} />
      </div>
    );
  }
}
