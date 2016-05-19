var path = require("path");
var express = require("express");
var webpack = require("webpack");
var config = require("./webpack.dev");

var app = express();
var compiler = webpack(config);

app.use(require("webpack-dev-middleware")(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath,
  headers: { "Access-Control-Allow-Origin": "*" },
}));

app.use(require("webpack-hot-middleware")(compiler));

app.get("*", function(req, res) {
  res.sendFile(path.join(__dirname, "index.dev.html"));
});

app.listen(3000, "0.0.0.0", function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log("Listening at http://0.0.0.0:3000");
});
