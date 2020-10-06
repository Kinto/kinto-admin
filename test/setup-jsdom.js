var jsdom = require("jsdom");

// Setup the jsdom environment
// @see https://github.com/facebook/react/issues/5046
const JSDOM = new jsdom.JSDOM("<!doctype html><html><body></body></html>");
global.window = JSDOM.window;
global.window.scrollTo = () => {};
global.document = window.document;
global.navigator = global.window.navigator;
// Fake a window.location to be a real url, and not `about:blank` which breaks
// react-router-redux's `syncHistoryWithStore`, called from the KintoAdmin
// component constructor.
JSDOM.reconfigure({ url: "http://server.test/" });

// Setup dumb sessionStorage for tests
global.sessionStorage = (function () {
  var _state = {};
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(_state, key)
        ? _state[key]
        : undefined;
    },
    setItem(key, value) {
      _state[key] = value === null ? "null" : value; // that's the spec
    },
    removeItem(key) {
      delete _state[key];
    },
  };
})();

// Enable rjsf safe render completion
// see https://github.com/mozilla-services/react-jsonschema-form/commit/6159cb4834a082b2af2154e6f978b9ad57e96d51
var Form = require("react-jsonschema-form").default;
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

// Setup Enzyme for testing react
const configure = require("enzyme").configure;
const Adapter = require("enzyme-adapter-react-16");

configure({ adapter: new Adapter() });
