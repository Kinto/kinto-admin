var jsdom = require("jsdom");

// Setup the jsdom environment
// @see https://github.com/facebook/react/issues/5046
global.document = jsdom.jsdom("<!doctype html><html><body></body></html>");
global.window = document.defaultView;
global.navigator = global.window.navigator;

// Setup dumb localStorage for tests
global.localStorage = (function() {
  var _state = {};
  return {
    getItem(key) {
      return _state.hasOwnProperty(key) ? _state[key] : undefined;
    },
    setItem(key, value) {
      _state[key] = value === null ? "null" : value; // that's the spec
    },
    removeItem(key) {
      delete _state[key];
    }
  };
})();

// Enable rjsf safe render completion
// see https://github.com/mozilla-services/react-jsonschema-form/commit/6159cb4834a082b2af2154e6f978b9ad57e96d51
var Form = require("react-jsonschema-form").default;
Form.defaultProps = {
  ...Form.defaultProps,
  safeRenderCompletion: true
};

// HTML debugging helper
global.d = function d(node) {
  console.log(require("html").prettyPrint(node.outerHTML, {indent_size: 2}));
};

// btoa polyfill for tests
global.btoa = require("btoa");
