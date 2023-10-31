// stub out scrollTo for tests
global.window.scrollTo = () => {};

// HTML debugging helper
global.d = function d(node) {
  console.log(require("html").prettyPrint(node.outerHTML, { indent_size: 2 }));
};

// btoa polyfill for tests
global.btoa = require("btoa");
global.atob = require("atob");
