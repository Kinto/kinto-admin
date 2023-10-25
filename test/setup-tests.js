// stub out scrollTo for tests
global.window.scrollTo = () => {};

// Enable rjsf safe render completion
// see https://github.com/mozilla-services/react-jsonschema-form/commit/6159cb4834a082b2af2154e6f978b9ad57e96d51
var Form = require("kinto-admin-form").default;
Form.defaultProps = {
  ...Form.defaultProps,
  safeRenderCompletion: true,
};

// HTML debugging helper
global.d = function d(node) {
  console.log(require("html").prettyPrint(node.outerHTML, { indent_size: 2 }));
};

// btoa polyfill for tests
global.btoa = require("btoa");
global.atob = require("atob");
