/* @flow */
import React, { Component } from "react";


const DEFAULT_SEPARATOR = ",";

function toTagList(
  tagsString: string,
  separator: string = DEFAULT_SEPARATOR,
  unique: bool = false
): string[] {
  const list = tagsString.split(separator)
    .map(tag => tag.trim())
    .filter(tag => tag !== "");
  return unique ? Array.from(new Set(list)) : list;
}

type Props = {
  schema: Object,
  uiSchema: Object,
  name: string,
  formData: string[],
  onChange: (tags: string[]) => void,
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
    uiSchema: {},
    required: false,
    readonly: false,
  };

  get separator(): string {
    const {uiSchema} = this.props;
    const {separator = DEFAULT_SEPARATOR} = uiSchema["ui:options"] || {};
    return separator === "" ? DEFAULT_SEPARATOR : separator;
  }

  constructor(props: Props) {
    super(props);
    this.state = {tagsString: props.formData.join(this.separator + " ")};
  }

  onChange = ({target: {value: tagsString}}: {target: {value: string}}) => {
    const {schema: {uniqueItems = false}, onChange} = this.props;
    const tags = toTagList(tagsString, this.separator, uniqueItems);
    this.setState({tagsString});
    setImmediate(() => onChange(tags));
  }

  render() {
    const {uiSchema, required, readonly} = this.props;
    const {tagsString} = this.state;
    return (
      <div className="form-group field field-string">
        <label className="control-label">
          {this.props.schema.title || this.props.name}
          {required ? "*" : ""}
        </label>
        <input
          type="text"
          className="form-control"
          value={tagsString}
          placeholder={uiSchema["ui:placeholder"] || ["tag1", "tag2", "tag3"].join(this.separator)}
          onChange={this.onChange}
          required={required}
          readOnly={readonly} />
        <div className="help-block">
          {uiSchema["ui:help"] ||
            <span>
              Entries must be separated with
              {this.separator === " " ? "spaces" : <code>{this.separator}</code>}.
            </span>}
        </div>
      </div>
    );
  }
}
