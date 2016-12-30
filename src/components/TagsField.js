/* @flow */
import React, { Component } from "react";


type Props = {
  schema: Object,
  uiSchema: Object,
  formData: string[],
  onChange: (value: string[]) => void,
  required: bool,
  readonly: bool,
};

type State = {
  tagsString: string,
}

export default class TagsField extends Component {
  props: Props;
  state: State;

  static defaultProps = {
    formData: [],
    required: false,
    readonly: false,
  };

  constructor(props: Props) {
    super(props);
    console.log(props);
    this.state = {tagsString: props.formData.join(", ")};
  }

  onChange = ({target: {value: tagsString}}: {target: {value: string}}) => {
    const tags = tagsString.split(",")
      .map(tag => tag.trim())
      .filter(tag => tag !== "");
    this.setState({tagsString});
    setImmediate(() => this.props.onChange(tags));
  }

  render() {
    const {uiSchema, required, readonly} = this.props;
    const {tagsString} = this.state;
    return (
      <div className="form-group field field-string">
        <label className="control-label">
          {this.props.schema.title || this.props.name || "Tags"}
          {required ? "*" : ""}
        </label>
        <input
          type="text"
          className="form-control"
          value={tagsString}
          placeholder={uiSchema["ui:placeholder"] || "tag1, tag2, tag3"}
          onChange={this.onChange}
          required={required}
          readOnly={readonly} />
        <p className="help-block">
          {uiSchema["ui:help"] || "Comma-separated strings"}
        </p>
      </div>
    );
  }
}
