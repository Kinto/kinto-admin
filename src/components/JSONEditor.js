/* @flow */
import React, { PureComponent } from "react";
import Codemirror from "react-codemirror";
import "codemirror/mode/javascript/javascript";

// Patching CodeMirror#componentWillReceiveProps so it's executed synchronously
// Ref https://github.com/mozilla-services/react-jsonschema-form/issues/174
Codemirror.prototype.componentWillReceiveProps = function(nextProps) {
  if (
    this.codeMirror &&
    nextProps.value !== undefined &&
    this.codeMirror.getValue() != nextProps.value
  ) {
    this.codeMirror.setValue(nextProps.value);
  }
  if (typeof nextProps.options === "object") {
    for (var optionName in nextProps.options) {
      if (nextProps.options.hasOwnProperty(optionName)) {
        this.codeMirror.setOption(optionName, nextProps.options[optionName]);
      }
    }
  }
};

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

  onCodeChange = (code: string) => {
    this.props.onChange(code);
  };

  render() {
    const { readonly, disabled, value } = this.props;
    return readonly || disabled
      ? <pre>{value}</pre>
      : <Codemirror
          value={value}
          onChange={this.onCodeChange}
          options={cmOptions}
        />;
  }
}
