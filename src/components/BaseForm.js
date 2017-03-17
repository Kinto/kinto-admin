/* @flow */
import React, { PureComponent } from "react";
import Form from "react-jsonschema-form";

import TagsField from "./TagsField";

const adminFields = { tags: TagsField };

export default class BaseForm extends PureComponent {
  render() {
    return <Form {...this.props} fields={adminFields} />;
  }
}
