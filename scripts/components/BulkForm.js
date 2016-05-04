import React,{ Component } from "react";
import { Link } from "react-router";
import Form from "react-jsonschema-form";

export default class BulkForm extends Component {
  defaultProps = {
    liveValidate: false
  };

  shouldComponentUpdate(nextProps) {
    return nextProps.name && nextProps.schema;
  }

  onSubmit({formData}) {
    if (formData.length > 0) {
      this.props.bulkCreate(formData);
    } else {
      this.props.notifyError({message: "The form is empty."});
    }
  }

  render() {
    const {name, schema, uiSchema, config} = this.props;
    const {liveValidate} = config;
    const bulkSchema = {type: "array", definitions: schema.definitions, items: schema};
    const bulkUiSchema = {items: uiSchema};
    const bulkFormData = [];
    return (
      <div>
        <h1>Bulk {name} creation</h1>
        <Form
          liveValidate={liveValidate}
          schema={bulkSchema}
          uiSchema={bulkUiSchema}
          formData={bulkFormData}
          onSubmit={this.onSubmit.bind(this)}>
          <input type="submit" className="btn btn-primary" value="Bulk create" />
          {" or "}
          <Link to={`/collections/${name}`}>Cancel</Link>
        </Form>
      </div>
    );
  }
}
