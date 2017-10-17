/* @flow */
import React, { PureComponent } from "react";
import CodeMirror from "react-codemirror2";
import "codemirror/mode/javascript/javascript";

const cmOptions = {
  theme: "default",
  height: "auto",
  viewportMargin: Infinity,
  mode: {
    name: "javascript",
    json: true,
    statementIndent: 2,
  },
  lineNumbers: true,
  lineWrapping: true,
  indentWithTabs: false,
  tabSize: 2,
};

export default class JSONEditor extends PureComponent {
  props: {
    readonly: boolean,
    disabled: boolean,
    value: any,
    onChange: (code: string) => void,
  };

  onCodeChange = (editor: Object, metadata: any, code: string) => {
    this.props.onChange(code);
  };

  render() {
    const { readonly, disabled, value } = this.props;
    return readonly || disabled ? (
      <pre>{value}</pre>
    ) : (
      <CodeMirror
        value={value}
        onChange={this.onCodeChange}
        options={cmOptions}
      />
    );
  }
}
