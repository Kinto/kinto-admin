/* @flow */
import React, { Component } from "react";
import Form from "react-jsonschema-form";

import TagsField from "./TagsField";


const adminFields = {tags: TagsField};

export default class BaseForm extends Component {
  render() {
    return <Form {...this.props} fields={adminFields} />;
  }
}
