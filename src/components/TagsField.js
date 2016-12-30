import React, { Component } from "react";


export default class TagsField extends Component {
  static defaultProps = {
    formData: [],
  };

  constructor(props) {
    super(props);
    this.state = {tagsString: props.formData.join(", ")};
  }

  onChange = ({target: {value: tagsString}}) => {
    const tags = tagsString.split(",")
      .map(tag => tag.trim())
      .filter(tag => tag !== "");
    this.setState({tagsString});
    setImmediate(() => this.props.onChange(tags));
  }

  render() {
    const {tagsString} = this.state;
    return <input type="text" value={tagsString} onChange={this.onChange} />;
  }
}
