var path = require("path");
var express = require("express");

var app = express();
app.use(express.static(path.join(__dirname, "..", "gh-pages")));

let server;

function start() {
  return new Promise((resolve, reject) => {
    server = app.listen(3000, "0.0.0.0", function(err) {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

function stop() {
  return new Promise((resolve) => {
    server.close(resolve);
  });
}

module.exports = {start, stop};
