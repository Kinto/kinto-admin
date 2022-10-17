import React, { PureComponent } from "react";
import type { FormProps } from "kinto-admin-form";
import Form from "kinto-admin-form";

import TagsField from "./TagsField";

const adminFields = { tags: TagsField };

export default class BaseForm extends PureComponent<FormProps> {
  render() {
    return (
      <Form
        {...this.props}
        className={`rjsf ${this.props.className ? this.props.className : ""}`}
        fields={adminFields}
      />
    );
  }
}
