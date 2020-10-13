/* @flow */
import React, { PureComponent } from "react";
import Form from "kinto-admin-form";

import TagsField from "./TagsField";

const adminFields = { tags: TagsField };

export default class BaseForm<Props, State = void> extends PureComponent<
  Props,
  State
> {
  render() {
    return <Form {...this.props} fields={adminFields} />;
  }
}
